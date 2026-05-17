import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, Plus, Send, ShieldCheck, Upload, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CONDITION_LABEL, PAYMENT_STATUS_LABEL, ORDER_STATUS_LABEL, PLATFORM_SWISH_NUMBER, calcFee } from '@/lib/marketplace';

interface Props { userId: string; }

interface PublicListing {
  id: string;
  course_code: string;
  title: string;
  description: string | null;
  condition: string;
  price_sek: number;
  image_url: string | null;
  status: string;
}

interface OwnListing extends PublicListing { seller_user_id: string; }

interface Order {
  id: string;
  listing_id: string;
  buyer_user_id: string;
  seller_user_id: string;
  gross_amount_sek: number;
  platform_fee_sek: number;
  seller_net_sek: number;
  swish_reference: string | null;
  payment_status: string;
  order_status: string;
  created_at: string;
  buyer_confirmed_delivery_at: string | null;
}

interface OrderMessage { id: string; sender_id: string; body: string; created_at: string; }

export default function MarketplacePage({ userId }: Props) {
  const [myCourses, setMyCourses] = useState<{ course_code: string; course_name: string }[]>([]);
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [myListings, setMyListings] = useState<OwnListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [checkoutListing, setCheckoutListing] = useState<PublicListing | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  // load
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [userId]);

  const refresh = async () => {
    const [coursesRes, listRes, myListRes, ordersRes, roleRes] = await Promise.all([
      supabase.from('user_courses').select('course_code, course_name').eq('user_id', userId),
      supabase.from('public_book_listings').select('*').eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('book_listings').select('*').eq('seller_user_id', userId).order('created_at', { ascending: false }),
      supabase.from('book_orders').select('*').or(`buyer_user_id.eq.${userId},seller_user_id.eq.${userId}`).order('created_at', { ascending: false }),
      supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle(),
    ]);
    const uniq = Array.from(new Map(((coursesRes.data || []) as { course_code: string; course_name: string }[]).map(c => [c.course_code, c])).values());
    setMyCourses(uniq);
    setListings((listRes.data || []) as PublicListing[]);
    setMyListings((myListRes.data || []) as OwnListing[]);
    setOrders((ordersRes.data || []) as Order[]);
    const admin = !!roleRes.data;
    setIsAdmin(admin);
    if (admin) {
      const { data } = await supabase.from('book_orders').select('*').order('created_at', { ascending: false }).limit(100);
      setAdminOrders((data || []) as Order[]);
    }
  };

  // Active order detail view
  if (activeOrder) {
    return <OrderDetail userId={userId} orderId={activeOrder.id} isAdmin={isAdmin} onBack={() => { setActiveOrder(null); refresh(); }} />;
  }

  if (checkoutListing) {
    return <CheckoutView userId={userId} listing={checkoutListing}
      onBack={() => setCheckoutListing(null)}
      onOrderCreated={async (orderId) => {
        setCheckoutListing(null);
        await refresh();
        const { data } = await supabase.from('book_orders').select('*').eq('id', orderId).single();
        if (data) setActiveOrder(data as Order);
      }} />;
  }

  const filteredListings = filterCourse === 'all'
    ? listings.filter(l => myCourses.some(c => c.course_code === l.course_code))
    : listings.filter(l => l.course_code === filterCourse);

  return (
    <div className="max-w-3xl mx-auto md:mt-12 animate-slide-up space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Kursböcker</h1>
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Sälj bok</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Lägg upp bokannons</DialogTitle></DialogHeader>
            <NewListingForm userId={userId} courses={myCourses} onDone={() => { setNewOpen(false); refresh(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="browse">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="browse">Köp</TabsTrigger>
          <TabsTrigger value="mine">Mina annonser</TabsTrigger>
          <TabsTrigger value="orders">Mina ordrar</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin"><ShieldCheck className="h-3 w-3 mr-1" /> Admin</TabsTrigger>}
        </TabsList>

        <TabsContent value="browse" className="space-y-3 mt-3">
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger><SelectValue placeholder="Filtrera kurs" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla mina kurser</SelectItem>
              {myCourses.map(c => <SelectItem key={c.course_code} value={c.course_code}>{c.course_code} – {c.course_name}</SelectItem>)}
            </SelectContent>
          </Select>
          {filteredListings.length === 0
            ? <p className="text-sm text-muted-foreground text-center py-8">Inga böcker till salu i dina kurser just nu.</p>
            : filteredListings.map(l => (
              <Card key={l.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setCheckoutListing(l)}>
                <CardContent className="p-3 flex gap-3">
                  {l.image_url
                    ? <img src={l.image_url} alt={l.title} className="h-20 w-16 object-cover rounded shrink-0" />
                    : <div className="h-20 w-16 bg-muted rounded shrink-0 flex items-center justify-center"><BookOpen className="h-6 w-6 text-muted-foreground" /></div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{l.course_code} · {CONDITION_LABEL[l.condition] || l.condition}</p>
                    {l.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{l.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-foreground">{l.price_sek} kr</p>
                    <Badge variant="secondary" className="text-[10px] mt-1">Anonym säljare</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="mine" className="space-y-2 mt-3">
          {myListings.length === 0
            ? <p className="text-sm text-muted-foreground text-center py-8">Du har inga annonser.</p>
            : myListings.map(l => (
              <Card key={l.id}>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{l.course_code} · {l.price_sek} kr</p>
                  </div>
                  <Badge variant={l.status === 'active' ? 'default' : 'secondary'}>{l.status}</Badge>
                  {l.status === 'active' && (
                    <Button size="sm" variant="outline" onClick={async () => {
                      await supabase.from('book_listings').update({ status: 'cancelled' }).eq('id', l.id);
                      refresh();
                    }}>Ta bort</Button>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="orders" className="space-y-2 mt-3">
          {orders.length === 0
            ? <p className="text-sm text-muted-foreground text-center py-8">Inga ordrar ännu.</p>
            : orders.map(o => (
              <Card key={o.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setActiveOrder(o)}>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{o.buyer_user_id === userId ? 'Köp' : 'Försäljning'} · {o.gross_amount_sek} kr</p>
                    <p className="text-xs text-muted-foreground">{PAYMENT_STATUS_LABEL[o.payment_status]} · {ORDER_STATUS_LABEL[o.order_status]}</p>
                  </div>
                  <Badge variant={o.payment_status === 'released' ? 'default' : 'secondary'}>{o.order_status}</Badge>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="space-y-2 mt-3">
            <p className="text-xs text-muted-foreground">Bekräfta inkommen Swish-betalning så öppnas chatt mellan köpare och säljare.</p>
            {adminOrders.map(o => (
              <Card key={o.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setActiveOrder(o)}>
                <CardContent className="p-3 text-xs space-y-1">
                  <div className="flex justify-between"><span className="font-mono">{o.id.slice(0, 8)}</span><Badge>{o.payment_status}</Badge></div>
                  <p>{o.gross_amount_sek} kr · avgift {o.platform_fee_sek} kr · netto {o.seller_net_sek} kr</p>
                  {o.swish_reference && <p className="text-muted-foreground">Ref: {o.swish_reference}</p>}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ---------- New listing form ----------
function NewListingForm({ userId, courses, onDone }: { userId: string; courses: { course_code: string; course_name: string }[]; onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState(courses[0]?.course_code || '');
  const [condition, setCondition] = useState('good');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const priceNum = Number.parseFloat(price);
    if (!title.trim() || !courseCode || !Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error('Fyll i titel, kurs och giltigt pris');
      return;
    }
    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('book-images').upload(path, imageFile);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('book-images').getPublicUrl(path);
        imageUrl = data.publicUrl;
      }
      const { error } = await supabase.from('book_listings').insert({
        seller_user_id: userId, course_code: courseCode, title: title.trim(),
        description: description.trim() || null, condition, price_sek: priceNum,
        image_url: imageUrl, status: 'active',
      });
      if (error) throw error;
      toast.success('Annons publicerad!');
      onDone();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Något gick fel');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Titel</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="t.ex. Calculus 8th ed." maxLength={120} />
      </div>
      <div>
        <Label>Kurs</Label>
        <Select value={courseCode} onValueChange={setCourseCode}>
          <SelectTrigger><SelectValue placeholder="Välj kurs" /></SelectTrigger>
          <SelectContent>
            {courses.map(c => <SelectItem key={c.course_code} value={c.course_code}>{c.course_code} – {c.course_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Skick</Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(CONDITION_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Pris (kr)</Label>
          <Input type="number" min="1" step="1" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Beskrivning</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={1000} rows={3} />
      </div>
      <div>
        <Label className="flex items-center gap-2"><Upload className="h-4 w-4" /> Bild (valfritt)</Label>
        <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
      </div>
      <Button onClick={submit} disabled={saving} className="w-full">{saving ? 'Publicerar...' : 'Publicera'}</Button>
      <p className="text-xs text-muted-foreground">Din identitet visas inte för köpare förrän betalning är bekräftad.</p>
    </div>
  );
}

// ---------- Checkout view ----------
function CheckoutView({ userId, listing, onBack, onOrderCreated }: {
  userId: string; listing: PublicListing; onBack: () => void; onOrderCreated: (orderId: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const fee = calcFee(listing.price_sek);

  const startOrder = async () => {
    setCreating(true);
    // We need seller_user_id from book_listings; fetch via RLS (active listings visible to all auth)
    const { data: real, error: fetchErr } = await supabase.from('book_listings')
      .select('seller_user_id, price_sek, status').eq('id', listing.id).single();
    if (fetchErr || !real) { toast.error('Kunde inte starta köp'); setCreating(false); return; }
    if (real.status !== 'active') { toast.error('Boken är inte längre tillgänglig'); setCreating(false); return; }
    if (real.seller_user_id === userId) { toast.error('Du kan inte köpa din egen bok'); setCreating(false); return; }
    const ref = `BOK-${listing.id.slice(0, 8).toUpperCase()}`;
    const { data, error } = await supabase.from('book_orders').insert({
      listing_id: listing.id, buyer_user_id: userId, seller_user_id: real.seller_user_id,
      gross_amount_sek: real.price_sek, platform_fee_sek: 0, seller_net_sek: 0,
      swish_reference: ref,
    }).select('id').single();
    setCreating(false);
    if (error || !data) { toast.error(error?.message || 'Kunde inte skapa order'); return; }
    onOrderCreated(data.id as string);
  };

  return (
    <div className="max-w-xl mx-auto md:mt-12 animate-slide-up space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> Tillbaka</Button>
      <Card>
        <CardContent className="p-4 flex gap-3">
          {listing.image_url
            ? <img src={listing.image_url} alt={listing.title} className="h-28 w-20 object-cover rounded" />
            : <div className="h-28 w-20 bg-muted rounded flex items-center justify-center"><BookOpen className="h-8 w-8 text-muted-foreground" /></div>}
          <div className="flex-1">
            <h2 className="font-semibold">{listing.title}</h2>
            <p className="text-sm text-muted-foreground">{listing.course_code} · {CONDITION_LABEL[listing.condition]}</p>
            {listing.description && <p className="text-sm mt-2 whitespace-pre-wrap">{listing.description}</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Pris</span><span className="font-medium">{listing.price_sek} kr</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Varav plattformsavgift (10%)</span><span>{fee.fee} kr</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Säljaren får</span><span>{fee.sellerNet} kr</span></div>
        </CardContent>
      </Card>
      <Card className="border-primary/30">
        <CardContent className="p-4 text-sm space-y-2">
          <p className="font-medium">Så fungerar köpet</p>
          <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
            <li>Du startar ordern och får en Swish-referens.</li>
            <li>Du Swish:ar totalbeloppet ({listing.price_sek} kr) till <span className="font-mono text-foreground">{PLATFORM_SWISH_NUMBER}</span> med referensen.</li>
            <li>När plattformen bekräftat betalningen öppnas chatt med säljaren för leverans.</li>
            <li>När du fått boken och godkänt skicket betalas säljaren ut.</li>
          </ol>
          <p className="text-xs">Säljarens identitet är dold tills betalningen är bekräftad.</p>
        </CardContent>
      </Card>
      <Button onClick={startOrder} disabled={creating} className="w-full">{creating ? 'Skapar order...' : 'Starta köp'}</Button>
    </div>
  );
}

// ---------- Order detail with chat ----------
function OrderDetail({ userId, orderId, isAdmin, onBack }: { userId: string; orderId: string; isAdmin: boolean; onBack: () => void }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [listing, setListing] = useState<PublicListing | null>(null);
  const [sellerName, setSellerName] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState<string | null>(null);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    const { data: o } = await supabase.from('book_orders').select('*').eq('id', orderId).single();
    if (!o) return;
    setOrder(o as Order);
    const { data: l } = await supabase.from('public_book_listings').select('*').eq('id', (o as Order).listing_id).maybeSingle();
    setListing(l as PublicListing);
    const unlocked = ['payment_confirmed', 'released'].includes((o as Order).payment_status);
    if (unlocked) {
      const ids = [((o as Order).seller_user_id), ((o as Order).buyer_user_id)];
      const { data: profs } = await supabase.from('profiles').select('user_id, display_name').in('user_id', ids);
      const map = new Map((profs || []).map(p => [p.user_id as string, (p.display_name as string) || 'Användare']));
      setSellerName(map.get((o as Order).seller_user_id) || 'Säljare');
      setBuyerName(map.get((o as Order).buyer_user_id) || 'Köpare');
      const { data: msgs } = await supabase.from('order_messages').select('*').eq('order_id', orderId).order('created_at', { ascending: true });
      setMessages((msgs || []) as OrderMessage[]);
    } else {
      setSellerName(null); setBuyerName(null); setMessages([]);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [orderId]);

  useEffect(() => {
    const ch = supabase.channel(`ord-${orderId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_messages', filter: `order_id=eq.${orderId}` },
        (p) => setMessages(prev => [...prev, p.new as OrderMessage]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'book_orders', filter: `id=eq.${orderId}` },
        () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [orderId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (!order) return <p>Laddar...</p>;
  const unlocked = ['payment_confirmed', 'released'].includes(order.payment_status);
  const isBuyer = order.buyer_user_id === userId;
  const isSeller = order.seller_user_id === userId;

  const send = async () => {
    if (!text.trim()) return;
    const body = text.trim().slice(0, 2000);
    setText('');
    const { error } = await supabase.from('order_messages').insert({ order_id: orderId, sender_id: userId, body });
    if (error) toast.error('Kunde inte skicka');
  };

  const confirmDelivery = async () => {
    await supabase.from('book_orders').update({
      order_status: 'delivered', buyer_confirmed_delivery_at: new Date().toISOString(),
    }).eq('id', orderId);
    toast.success('Tack! Plattformen kommer betala ut säljaren.');
    load();
  };

  const adminConfirmPayment = async () => {
    await supabase.from('book_orders').update({
      payment_status: 'payment_confirmed', order_status: 'paid',
    }).eq('id', orderId);
    toast.success('Betalning bekräftad – chatt öppnad.');
    load();
  };

  const adminMarkReleased = async () => {
    await supabase.from('book_orders').update({
      payment_status: 'released', order_status: 'completed',
    }).eq('id', orderId);
    toast.success('Utbetalning markerad. Annons satt till såld.');
    load();
  };

  const cancel = async () => {
    await supabase.from('book_orders').update({ order_status: 'cancelled', payment_status: 'failed' }).eq('id', orderId);
    toast.success('Order avbruten');
    load();
  };

  const copyRef = () => {
    if (!order.swish_reference) return;
    navigator.clipboard.writeText(order.swish_reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto md:mt-12 animate-slide-up space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> Tillbaka</Button>

      {listing && (
        <Card>
          <CardContent className="p-3 flex gap-3 items-center">
            {listing.image_url
              ? <img src={listing.image_url} alt={listing.title} className="h-16 w-12 object-cover rounded" />
              : <div className="h-16 w-12 bg-muted rounded flex items-center justify-center"><BookOpen className="h-5 w-5 text-muted-foreground" /></div>}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{listing.title}</p>
              <p className="text-xs text-muted-foreground">{listing.course_code}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 text-sm space-y-2">
          <div className="flex justify-between"><span className="text-muted-foreground">Belopp</span><span className="font-medium">{order.gross_amount_sek} kr</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Plattformsavgift</span><span>{order.platform_fee_sek} kr</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Säljarens netto</span><span>{order.seller_net_sek} kr</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Betalstatus</span><Badge variant="secondary">{PAYMENT_STATUS_LABEL[order.payment_status]}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Orderstatus</span><Badge>{ORDER_STATUS_LABEL[order.order_status]}</Badge></div>
        </CardContent>
      </Card>

      {!unlocked && isBuyer && order.payment_status === 'awaiting_payment' && (
        <Card className="border-primary/30">
          <CardContent className="p-4 text-sm space-y-3">
            <p className="font-medium">Betala nu via Swish</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Till nummer</span>
                <span className="font-mono font-semibold">{PLATFORM_SWISH_NUMBER}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Belopp</span>
                <span className="font-semibold">{order.gross_amount_sek} kr</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Meddelande / referens</span>
                <button onClick={copyRef} className="font-mono font-semibold flex items-center gap-1 hover:text-primary">
                  {order.swish_reference} {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">När plattformen sett din betalning bekräftas ordern och chatt med säljaren öppnas.</p>
            <Button variant="outline" size="sm" onClick={cancel}>Avbryt order</Button>
          </CardContent>
        </Card>
      )}

      {unlocked && (
        <Card>
          <CardContent className="p-4 text-sm space-y-2">
            <p className="font-medium">{isBuyer ? 'Säljare' : 'Köpare'}</p>
            <p>{isBuyer ? sellerName : buyerName}</p>
          </CardContent>
        </Card>
      )}

      {unlocked && (
        <Card className="flex flex-col h-[50vh] overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && <p className="text-xs text-muted-foreground text-center">Säg hej och kom överens om leverans.</p>}
            {messages.map(m => {
              const mine = m.sender_id === userId;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </CardContent>
          <div className="border-t p-2 flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Skriv ett meddelande..." maxLength={2000}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <Button size="icon" onClick={send}><Send className="h-4 w-4" /></Button>
          </div>
        </Card>
      )}

      {unlocked && isBuyer && order.order_status === 'paid' && (
        <Button onClick={confirmDelivery} className="w-full">Bekräfta mottagen & godkänd bok</Button>
      )}

      {isAdmin && (
        <Card className="border-warning/30">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-medium flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Admin-åtgärder</p>
            {order.payment_status === 'awaiting_payment' && (
              <Button size="sm" onClick={adminConfirmPayment} className="w-full">Bekräfta Swish-betalning mottagen</Button>
            )}
            {order.payment_status === 'payment_confirmed' && order.order_status !== 'completed' && (
              <Button size="sm" variant="outline" onClick={adminMarkReleased} className="w-full">Markera som utbetald till säljare</Button>
            )}
            {order.payment_status !== 'released' && order.order_status !== 'cancelled' && (
              <Button size="sm" variant="ghost" onClick={cancel} className="w-full text-destructive">Avbryt order</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
