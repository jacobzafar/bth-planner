import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props { userId: string; }

export default function VisibilityCard({ userId }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('profiles')
      .select('is_visible, display_name')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        setIsVisible(!!data?.is_visible);
        setDisplayName(data?.display_name ?? '');
        setLoading(false);
      });
  }, [userId]);

  const save = async () => {
    setSaving(true);
    const name = displayName.trim().slice(0, 60);
    const { error } = await supabase.from('profiles')
      .update({ is_visible: isVisible, display_name: name || null })
      .eq('user_id', userId);
    setSaving(false);
    if (error) { toast.error('Kunde inte spara'); return; }
    toast.success('Sparat');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base flex items-center gap-2">
          <Users className="h-4 w-4" /> Synlighet för kursdeltagare
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          När du är synlig kan andra synliga deltagare i dina kurser se dig och chatta med dig.
          Är du osynlig syns du inte – och du ser inte heller andra deltagare eller chatten.
        </p>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="vis-toggle" className="text-sm">Visa mig för andra deltagare</Label>
          <Switch id="vis-toggle" checked={isVisible} onCheckedChange={setIsVisible} disabled={loading} />
        </div>
        <div>
          <Label htmlFor="display-name" className="text-sm">Visningsnamn (valfritt)</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="t.ex. Anna L."
            maxLength={60}
            disabled={loading}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">Visas för andra deltagare. Lämna tomt för att visas anonymt.</p>
        </div>
        <Button onClick={save} disabled={saving || loading} size="sm">
          {saving ? 'Sparar...' : 'Spara synlighet'}
        </Button>
      </CardContent>
    </Card>
  );
}
