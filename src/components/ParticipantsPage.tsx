import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Users, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Props { userId: string; }

interface Participant {
  user_id: string;
  display_name: string | null;
  program_name: string | null;
  shared_courses: string[];
}

interface DmMessage { id: string; sender_id: string; body: string; created_at: string; }
interface CourseMessage { id: string; user_id: string; body: string; created_at: string; }

export default function ParticipantsPage({ userId }: Props) {
  const [isVisible, setIsVisible] = useState<boolean | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [courses, setCourses] = useState<{ course_code: string; course_name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [activeDm, setActiveDm] = useState<Participant | null>(null);
  const [dmThread, setDmThread] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<DmMessage[]>([]);
  const [dmText, setDmText] = useState('');
  const [activeCourseChat, setActiveCourseChat] = useState<string | null>(null);
  const [courseMessages, setCourseMessages] = useState<CourseMessage[]>([]);
  const [courseChatText, setCourseChatText] = useState('');
  const [nameCache, setNameCache] = useState<Record<string, string>>({});
  const endRef = useRef<HTMLDivElement | null>(null);

  // Load visibility + courses + participants
  useEffect(() => {
    (async () => {
      const [profileRes, myCoursesRes] = await Promise.all([
        supabase.from('profiles').select('is_visible').eq('user_id', userId).maybeSingle(),
        supabase.from('user_courses').select('course_code, course_name').eq('user_id', userId),
      ]);
      const visible = !!profileRes.data?.is_visible;
      setIsVisible(visible);
      const myCourses = (myCoursesRes.data || []) as { course_code: string; course_name: string }[];
      // dedupe by code
      const uniq = Array.from(new Map(myCourses.map(c => [c.course_code, c])).values());
      setCourses(uniq);
      if (!visible) return;
      await loadParticipants(uniq.map(c => c.course_code));
    })();
  }, [userId]);

  const loadParticipants = async (codes: string[]) => {
    if (codes.length === 0) { setParticipants([]); return; }
    // Find other user_ids sharing any of my courses
    const { data: peerCourses } = await supabase
      .from('user_courses')
      .select('user_id, course_code')
      .in('course_code', codes)
      .neq('user_id', userId);
    if (!peerCourses) return;
    const peerMap = new Map<string, Set<string>>();
    for (const row of peerCourses) {
      if (!peerMap.has(row.user_id)) peerMap.set(row.user_id, new Set());
      peerMap.get(row.user_id)!.add(row.course_code);
    }
    const peerIds = Array.from(peerMap.keys());
    if (peerIds.length === 0) { setParticipants([]); return; }
    // Filter to visible profiles via the visible_profiles view
    const { data: profs } = await supabase
      .from('visible_profiles')
      .select('user_id, display_name, program_name')
      .in('user_id', peerIds);
    const list: Participant[] = (profs || []).map(p => ({
      user_id: p.user_id as string,
      display_name: (p.display_name as string | null) ?? null,
      program_name: (p.program_name as string | null) ?? null,
      shared_courses: Array.from(peerMap.get(p.user_id as string) || []),
    }));
    setParticipants(list);
    setNameCache(prev => {
      const next = { ...prev };
      for (const p of list) next[p.user_id] = p.display_name || 'Anonym deltagare';
      return next;
    });
  };

  // DM opening
  const openDm = async (peer: Participant) => {
    setActiveDm(peer);
    setActiveCourseChat(null);
    const [a, b] = [userId, peer.user_id].sort();
    // try to find existing
    const { data: existing } = await supabase.from('dm_threads')
      .select('id').eq('user_a', a).eq('user_b', b).maybeSingle();
    let threadId = existing?.id as string | undefined;
    if (!threadId) {
      const { data: created, error } = await supabase.from('dm_threads')
        .insert({ user_a: a, user_b: b }).select('id').single();
      if (error) { toast.error('Kunde inte öppna chatt'); return; }
      threadId = created.id as string;
    }
    setDmThread(threadId);
    const { data: msgs } = await supabase.from('dm_messages')
      .select('id, sender_id, body, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    setDmMessages((msgs || []) as DmMessage[]);
  };

  // Realtime DM subscription
  useEffect(() => {
    if (!dmThread) return;
    const channel = supabase.channel(`dm-${dmThread}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'dm_messages', filter: `thread_id=eq.${dmThread}` },
        (payload) => {
          setDmMessages(prev => [...prev, payload.new as DmMessage]);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [dmThread]);

  // Realtime course chat
  useEffect(() => {
    if (!activeCourseChat) return;
    const channel = supabase.channel(`cc-${activeCourseChat}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'course_chat_messages', filter: `course_code=eq.${activeCourseChat}` },
        (payload) => {
          setCourseMessages(prev => [...prev, payload.new as CourseMessage]);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeCourseChat]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dmMessages, courseMessages]);

  const sendDm = async () => {
    if (!dmThread || !dmText.trim()) return;
    const body = dmText.trim().slice(0, 2000);
    setDmText('');
    const { error } = await supabase.from('dm_messages')
      .insert({ thread_id: dmThread, sender_id: userId, body });
    if (error) toast.error('Kunde inte skicka');
  };

  const openCourseChat = async (code: string) => {
    setActiveCourseChat(code);
    setActiveDm(null);
    setDmThread(null);
    const { data } = await supabase.from('course_chat_messages')
      .select('id, user_id, body, created_at')
      .eq('course_code', code)
      .order('created_at', { ascending: true })
      .limit(200);
    setCourseMessages((data || []) as CourseMessage[]);
    // Resolve missing names via visible_profiles
    const ids = Array.from(new Set((data || []).map(m => m.user_id as string)));
    const missing = ids.filter(id => !nameCache[id] && id !== userId);
    if (missing.length) {
      const { data: profs } = await supabase.from('visible_profiles')
        .select('user_id, display_name').in('user_id', missing);
      setNameCache(prev => {
        const next = { ...prev };
        for (const p of (profs || [])) next[p.user_id as string] = (p.display_name as string) || 'Anonym deltagare';
        return next;
      });
    }
  };

  const sendCourseMsg = async () => {
    if (!activeCourseChat || !courseChatText.trim()) return;
    const body = courseChatText.trim().slice(0, 2000);
    setCourseChatText('');
    const { error } = await supabase.from('course_chat_messages')
      .insert({ course_code: activeCourseChat, user_id: userId, body });
    if (error) toast.error('Kunde inte skicka');
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return participants;
    const q = search.toLowerCase();
    return participants.filter(p =>
      (p.display_name || '').toLowerCase().includes(q) ||
      p.shared_courses.some(c => c.toLowerCase().includes(q)),
    );
  }, [participants, search]);

  if (isVisible === null) {
    return <p className="text-muted-foreground">Laddar...</p>;
  }

  if (!isVisible) {
    return (
      <div className="max-w-2xl mx-auto md:mt-12 animate-slide-up">
        <Card className="border-warning/30">
          <CardContent className="p-6 space-y-3 text-center">
            <EyeOff className="h-10 w-10 text-warning mx-auto" />
            <h2 className="font-heading text-lg font-semibold">Du är osynlig</h2>
            <p className="text-sm text-muted-foreground">
              För att se andra kursdeltagare och kunna chatta måste du aktivera synlighet i inställningarna.
            </p>
            <Button asChild>
              <Link to="/installningar">Gå till inställningar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chat detail view (DM or course)
  if (activeDm || activeCourseChat) {
    const isDm = !!activeDm;
    const title = isDm
      ? (activeDm!.display_name || 'Anonym deltagare')
      : `Kurschatt ${activeCourseChat}`;
    return (
      <div className="max-w-2xl mx-auto md:mt-12 animate-slide-up flex flex-col h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="sm" onClick={() => { setActiveDm(null); setActiveCourseChat(null); setDmThread(null); }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-heading font-semibold">{title}</h2>
        </div>
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-2">
            {(isDm ? dmMessages : courseMessages).map(m => {
              const senderId = isDm ? (m as DmMessage).sender_id : (m as CourseMessage).user_id;
              const mine = senderId === userId;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {!mine && !isDm && (
                      <p className="text-[10px] opacity-70 mb-0.5">{nameCache[senderId] || 'Deltagare'}</p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </CardContent>
          <div className="border-t p-2 flex gap-2">
            <Input
              value={isDm ? dmText : courseChatText}
              onChange={(e) => isDm ? setDmText(e.target.value) : setCourseChatText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); isDm ? sendDm() : sendCourseMsg(); } }}
              placeholder="Skriv ett meddelande..."
              maxLength={2000}
            />
            <Button size="icon" onClick={() => isDm ? sendDm() : sendCourseMsg()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto md:mt-12 animate-slide-up space-y-4">
      <h1 className="font-heading text-2xl font-bold">Deltagare</h1>
      <Tabs defaultValue="people">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="people"><Users className="h-4 w-4 mr-1" /> Personer</TabsTrigger>
          <TabsTrigger value="groups"><MessageCircle className="h-4 w-4 mr-1" /> Kurschattar</TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="space-y-3 mt-3">
          <Input placeholder="Sök namn eller kurskod..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Inga synliga deltagare hittades i dina kurser ännu.</p>
          ) : filtered.map(p => (
            <Card key={p.user_id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDm(p)}>
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{p.display_name || 'Anonym deltagare'}</p>
                  {p.program_name && <p className="text-xs text-muted-foreground truncate">{p.program_name.split(',')[0]}</p>}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.shared_courses.slice(0, 3).map(c => (
                      <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                    ))}
                    {p.shared_courses.length > 3 && (
                      <Badge variant="outline" className="text-[10px]">+{p.shared_courses.length - 3}</Badge>
                    )}
                  </div>
                </div>
                <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="groups" className="space-y-2 mt-3">
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Du har inga kurser ännu.</p>
          ) : courses.map(c => (
            <Card key={c.course_code} className="cursor-pointer hover:bg-muted/50" onClick={() => openCourseChat(c.course_code)}>
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold">{c.course_code}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.course_name}</p>
                </div>
                <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
