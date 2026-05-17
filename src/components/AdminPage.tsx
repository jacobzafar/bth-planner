import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { PAYMENT_STATUS_LABEL, ORDER_STATUS_LABEL } from '@/lib/marketplace';
const formatSek = (n: number | string) => `${Number(n).toFixed(2)} kr`;
const paymentStatusLabel = (s: string) => PAYMENT_STATUS_LABEL[s] || s;
const orderStatusLabel = (s: string) => ORDER_STATUS_LABEL[s] || s;
import { Loader2, Shield, ShieldOff, Trash2 } from 'lucide-react';

interface Props { userId: string }

type Profile = {
  user_id: string;
  display_name: string | null;
  program_name: string | null;
  start_year: number | null;
  is_visible: boolean;
  setup_complete: boolean | null;
  created_at: string;
};

type Listing = {
  id: string; title: string; course_code: string; price_sek: number;
  status: string; seller_user_id: string; created_at: string;
};

type Order = {
  id: string; listing_id: string; buyer_user_id: string; seller_user_id: string;
  gross_amount_sek: number; platform_fee_sek: number; seller_net_sek: number;
  payment_status: string; order_status: string; swish_reference: string | null;
  buyer_confirmed_delivery_at: string | null;
  created_at: string;
};

type UserCourse = {
  id: string; user_id: string; course_code: string; course_name: string;
  status: string; year: number; hp: number;
};

export default function AdminPage({ userId }: Props) {
  const { isAdmin, loading: roleLoading } = useIsAdmin(userId);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  const loadAll = async () => {
    setLoading(true);
    const [p, l, o, c, r] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('book_listings').select('*').order('created_at', { ascending: false }),
      supabase.from('book_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('user_courses').select('*'),
      supabase.from('user_roles').select('user_id, role').eq('role', 'admin'),
    ]);
    setProfiles((p.data as Profile[]) || []);
    setListings((l.data as Listing[]) || []);
    setOrders((o.data as Order[]) || []);
    setCourses((c.data as UserCourse[]) || []);
    setAdminIds(new Set((r.data || []).map((x: any) => x.user_id)));
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  if (roleLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (!isAdmin) {
    return (
      <Card className="p-8 text-center">
        <h2 className="font-heading text-xl mb-2">Åtkomst nekad</h2>
        <p className="text-muted-foreground">Du har inte admin-behörighet.</p>
      </Card>
    );
  }

  const displayFor = (uid: string) => {
    const p = profiles.find(x => x.user_id === uid);
    return p?.display_name || uid.slice(0, 8);
  };

  const toggleAdmin = async (uid: string) => {
    if (uid === userId) { toast.error('Du kan inte ta bort din egen admin-roll'); return; }
    if (adminIds.has(uid)) {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', uid).eq('role', 'admin');
      if (error) return toast.error(error.message);
      toast.success('Admin-roll borttagen');
    } else {
      const { error } = await supabase.from('user_roles').insert({ user_id: uid, role: 'admin' });
      if (error) return toast.error(error.message);
      toast.success('Admin-roll tilldelad');
    }
    loadAll();
  };

  const confirmPayment = async (orderId: string) => {
    const ref = prompt('Swish-referens (valfri):') || null;
    const { error } = await supabase.from('book_orders').update({
      payment_status: 'payment_confirmed', swish_reference: ref,
    }).eq('id', orderId);
    if (error) return toast.error(error.message);
    toast.success('Betalning bekräftad – chatt öppnad');
    loadAll();
  };

  const markReleased = async (orderId: string) => {
    const { error } = await supabase.from('book_orders').update({
      payment_status: 'released', order_status: 'completed',
    }).eq('id', orderId);
    if (error) return toast.error(error.message);
    toast.success('Säljaren markerad som utbetald');
    loadAll();
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Avbryt order? Annonsen återaktiveras.')) return;
    const { error } = await supabase.from('book_orders').update({
      order_status: 'cancelled', payment_status: 'failed',
    }).eq('id', orderId);
    if (error) return toast.error(error.message);
    toast.success('Order avbruten');
    loadAll();
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Ta bort annons?')) return;
    const { error } = await supabase.from('book_listings').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Annons borttagen');
    loadAll();
  };

  const filteredProfiles = profiles.filter(p => {
    const q = userSearch.toLowerCase();
    return !q || (p.display_name?.toLowerCase().includes(q)) || p.user_id.includes(q) || (p.program_name?.toLowerCase().includes(q));
  });

  const totalRevenue = orders.filter(o => o.payment_status === 'released').reduce((s, o) => s + Number(o.gross_amount_sek), 0);
  const totalFees = orders.filter(o => o.payment_status === 'released').reduce((s, o) => s + Number(o.platform_fee_sek), 0);
  const pendingPayments = orders.filter(o => o.payment_status === 'awaiting_payment').length;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold">Adminpanel</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Användare</p><p className="text-2xl font-bold">{profiles.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Aktiva annonser</p><p className="text-2xl font-bold">{listings.filter(l => l.status === 'active').length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Väntar betalning</p><p className="text-2xl font-bold">{pendingPayments}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Plattformsavgift</p><p className="text-2xl font-bold">{formatSek(totalFees)}</p></Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="orders">Försäljningar</TabsTrigger>
          <TabsTrigger value="listings">Annonser</TabsTrigger>
          <TabsTrigger value="users">Användare</TabsTrigger>
          <TabsTrigger value="courses">Kurser</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-3">
          <p className="text-sm text-muted-foreground">Total omsättning: {formatSek(totalRevenue)} · Avgifter: {formatSek(totalFees)}</p>
          {orders.length === 0 && <p className="text-muted-foreground text-sm">Inga ordrar.</p>}
          {orders.map(o => {
            const listing = listings.find(l => l.id === o.listing_id);
            return (
              <Card key={o.id} className="p-4 space-y-2">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-semibold">{listing?.title || 'Okänd bok'} <span className="text-muted-foreground text-sm">({listing?.course_code})</span></p>
                    <p className="text-xs text-muted-foreground">Köpare: {displayFor(o.buyer_user_id)} · Säljare: {displayFor(o.seller_user_id)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatSek(o.gross_amount_sek)}</p>
                    <p className="text-xs text-muted-foreground">Avg: {formatSek(o.platform_fee_sek)} · Netto: {formatSek(o.seller_net_sek)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{paymentStatusLabel(o.payment_status)}</Badge>
                  <Badge variant="outline">{orderStatusLabel(o.order_status)}</Badge>
                  {o.swish_reference && <Badge variant="secondary">Ref: {o.swish_reference}</Badge>}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {o.payment_status === 'awaiting_payment' && (
                    <Button size="sm" onClick={() => confirmPayment(o.id)}>Bekräfta Swish</Button>
                  )}
                  {o.payment_status === 'payment_confirmed' && o.buyer_confirmed_delivery_at && (
                    <Button size="sm" onClick={() => markReleased(o.id)}>Markera utbetald</Button>
                  )}
                  {o.payment_status === 'payment_confirmed' && !o.buyer_confirmed_delivery_at && (
                    <Button size="sm" variant="outline" onClick={() => markReleased(o.id)}>Tvinga utbetalning</Button>
                  )}
                  {o.order_status !== 'cancelled' && o.order_status !== 'completed' && (
                    <Button size="sm" variant="ghost" onClick={() => cancelOrder(o.id)}>Avbryt</Button>
                  )}
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="listings" className="space-y-3">
          {listings.length === 0 && <p className="text-muted-foreground text-sm">Inga annonser.</p>}
          {listings.map(l => (
            <Card key={l.id} className="p-4 flex justify-between items-center gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{l.title}</p>
                <p className="text-xs text-muted-foreground">{l.course_code} · {displayFor(l.seller_user_id)} · {formatSek(l.price_sek)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline">{l.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteListing(l.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="users" className="space-y-3">
          <Input placeholder="Sök användare..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
          {filteredProfiles.map(p => {
            const isAdm = adminIds.has(p.user_id);
            return (
              <Card key={p.user_id} className="p-4 flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{p.display_name || '(inget namn)'} {isAdm && <Badge className="ml-1">Admin</Badge>}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.program_name || 'Inget program'} · Start {p.start_year || '–'} · {p.is_visible ? 'Synlig' : 'Dold'}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.user_id}</p>
                </div>
                <Button size="sm" variant={isAdm ? 'outline' : 'default'} onClick={() => toggleAdmin(p.user_id)} disabled={p.user_id === userId}>
                  {isAdm ? <><ShieldOff className="h-4 w-4 mr-1" />Ta bort admin</> : <><Shield className="h-4 w-4 mr-1" />Gör till admin</>}
                </Button>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="courses" className="space-y-3">
          {profiles.map(p => {
            const uc = courses.filter(c => c.user_id === p.user_id);
            if (uc.length === 0) return null;
            return (
              <Card key={p.user_id} className="p-4">
                <p className="font-semibold mb-2">{p.display_name || p.user_id.slice(0, 8)} <span className="text-xs text-muted-foreground">({uc.length} kurser)</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                  {uc.map(c => (
                    <div key={c.id} className="flex justify-between gap-2 border-b py-1">
                      <span className="truncate">{c.course_code} {c.course_name}</span>
                      <Badge variant="outline" className="shrink-0">{c.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
