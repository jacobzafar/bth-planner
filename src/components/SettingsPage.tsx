import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

interface SettingsPageProps {
  programName: string;
  startYear: number;
  onLogout: () => void;
}

export default function SettingsPage({ programName, startYear, onLogout }: SettingsPageProps) {
  return (
    <div className="max-w-lg mx-auto md:mt-12 animate-slide-up space-y-4">
      <h1 className="font-heading text-2xl font-bold text-foreground">Inställningar</h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Program</span>
            <span className="text-sm text-foreground font-medium text-right max-w-[250px] truncate">{programName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Startår</span>
            <span className="text-sm text-foreground">{startYear}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button variant="destructive" onClick={onLogout} className="w-full gap-2">
            <LogOut className="h-4 w-4" /> Logga ut
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
