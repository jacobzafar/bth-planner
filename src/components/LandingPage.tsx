import { GraduationCap, BookOpen, Target, AlertTriangle, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

const features = [
  { icon: BookOpen, title: 'Studieframsteg', text: 'Se hur många HP du klarat och vad som återstår.' },
  { icon: Target, title: 'Fokusera härnäst', text: 'Prioriterar tentor, uppgifter och labbar utifrån deadline, HP och kurskoppling.' },
  { icon: AlertTriangle, title: 'Riskbild', text: 'Upptäck saknade förkunskaper och kurser som kan spärras.' },
  { icon: CalendarCheck, title: 'Kalender & delmoment', text: 'Koppla händelser till kurser och följ upp moment med HP.' },
];

const steps = [
  'Välj program och startår',
  'Markera kursstatus och lägg till delmoment',
  'Följ rekommendationer och kommande deadlines',
];

export default function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-base sm:text-lg text-foreground">BTH Studieplanerare</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onLogin}>Logga in</Button>
            <Button size="sm" onClick={onSignup}>Skapa konto</Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container py-16 sm:py-24 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight">
            Planera dina studier smartare
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
            BTH Studieplanerare hjälper dig hålla koll på kurser, deadlines, delmoment, studieframsteg och risker för spärrade kurser.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" onClick={onLogin}>Logga in</Button>
            <Button size="lg" variant="outline" onClick={onSignup}>Skapa konto</Button>
          </div>
        </section>

        {/* Features */}
        <section className="container pb-16 sm:pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(f => (
              <Card key={f.title}>
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-secondary/40 border-y border-border">
          <div className="container py-16 sm:py-20">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-foreground mb-10">
              Så fungerar det
            </h2>
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {steps.map((step, idx) => (
                <li key={step} className="bg-card border border-border rounded-lg p-6 text-center">
                  <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground font-heading font-bold flex items-center justify-center mx-auto mb-3">
                    {idx + 1}
                  </div>
                  <p className="text-sm sm:text-base text-foreground">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Trust */}
        <section className="container py-12 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Byggd för studenter på BTH. Din studieplan baseras på valt program, startår och dina egna kursstatusar.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Button onClick={onLogin}>Logga in</Button>
            <Button variant="outline" onClick={onSignup}>Skapa konto</Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="container py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} BTH Studieplanerare
        </div>
      </footer>
    </div>
  );
}
