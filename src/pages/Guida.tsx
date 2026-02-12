import { motion } from 'framer-motion';
import { ArrowLeft, Bell, ClipboardCheck, Camera, Apple, Dumbbell, TrendingUp, FileText, Settings, Trophy, BookOpen, Smartphone, MessageSquare, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Footer from '@/components/legal/Footer';
import BottomDock from '@/components/BottomDock';

const Guida = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-5 py-6 sm:py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Guida all'App</h1>
            <p className="text-xs text-muted-foreground">Tutto quello che devi sapere</p>
          </div>
        </motion.header>

        <div className="space-y-6">

          {/* HIGHLIGHTED: Notifiche Push */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="card-elegant p-6 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                NUOVO
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-full bg-amber-500/20">
                  <Bell className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Attiva le Notifiche Push</h2>
                  <p className="text-xs text-muted-foreground">Non perderti nessun aggiornamento</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Ricevi notifiche in tempo reale quando il tuo coach ti scrive, carica un piano alimentare,
                o risponde ai tuoi video. I coach ricevono notifiche quando un cliente compila il check-in o invia foto.
              </p>

              <div className="space-y-3 mb-5">
                <h3 className="text-sm font-semibold">Come attivare:</h3>
                <div className="flex items-start gap-3 bg-background/50 rounded-xl p-3">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
                  <div>
                    <p className="text-sm font-medium">Vai nelle Impostazioni</p>
                    <p className="text-xs text-muted-foreground">Tocca l'icona ingranaggio in alto a destra nella pagina Diario</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-background/50 rounded-xl p-3">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
                  <div>
                    <p className="text-sm font-medium">Sezione "Notifiche"</p>
                    <p className="text-xs text-muted-foreground">Troverai la sezione Notifiche con l'icona campana</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-background/50 rounded-xl p-3">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
                  <div>
                    <p className="text-sm font-medium">Attiva il toggle</p>
                    <p className="text-xs text-muted-foreground">Il browser ti chiedera' il permesso: tocca "Consenti"</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 rounded-xl p-3 mb-4">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  <strong>Suggerimento:</strong> Su iPhone, devi prima installare l'app (vedi sezione "Installa l'App" qui sotto),
                  poi attivare le notifiche dalle Impostazioni. Safari non supporta le notifiche push senza PWA installata.
                </p>
              </div>

              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => navigate('/settings')}
              >
                <Bell className="w-4 h-4 mr-2" />
                Vai alle Impostazioni
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </motion.section>

          {/* Sezioni funzionalita' */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="card-elegant rounded-2xl overflow-hidden">
              <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-semibold">Le Funzionalita'</h2>
                </div>
              </div>

              <Accordion type="single" collapsible className="px-6">

                {/* Diario */}
                <AccordionItem value="diario" className="border-border/50">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="w-5 h-5 text-[hsl(var(--section-red))]" />
                      <span>Diario & Check-in Giornaliero</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-muted-foreground">
                      <p>La pagina principale dell'app. Qui trovi tutto il tuo percorso a colpo d'occhio.</p>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Cosa puoi fare:</p>
                        <ul className="space-y-1.5 pl-4">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span><strong>Check-in giornaliero:</strong> Ogni giorno compila il tuo check-in per registrare recupero, energia, mindset, aderenza nutrizionale e il tuo "2% Edge" (la cosa in piu' che hai fatto oggi).</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span><strong>Cerchio Momentum:</strong> Mostra la percentuale di completamento della settimana.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span><strong>Streak:</strong> I giorni consecutivi di check-in. Piu' lunga e' la streak, piu' badges sblocchi!</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span><strong>Badges Elite Evolution:</strong> Tocca la barra dei badges per vedere tutti i traguardi disponibili (dalla Scintilla alla Leggenda!).</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span><strong>Grafico settimanale:</strong> Visualizza i tuoi punteggi degli ultimi 7 giorni.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span><strong>Diario pensieri:</strong> Rivedi i tuoi "2% Edge" passati per riflettere sui progressi.</span>
                          </li>
                        </ul>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/diario')}>
                        Vai al Diario <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Checks */}
                <AccordionItem value="checks" className="border-border/50">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-blue-500" />
                      <span>Check Mensili (Peso & Foto)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-muted-foreground">
                      <p>Ogni mese (o quando il coach lo richiede) puoi inviare un check con peso e foto del fisico.</p>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Come funziona:</p>
                        <ul className="space-y-1.5 pl-4">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span><strong>Peso:</strong> Inserisci il tuo peso attuale.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span><strong>3 Foto:</strong> Scatta le foto frontale, laterale e posteriore. Puoi ritagliarle direttamente nell'app.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span><strong>Note:</strong> Aggiungi note per il coach (come ti senti, cambiamenti notati, ecc.).</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-blue-500/10 rounded-lg p-3 text-xs">
                        <strong>Suggerimento:</strong> Per le foto migliori, usa la stessa luce e lo stesso sfondo ogni volta.
                        Puoi scegliere dalla galleria o scattare direttamente.
                      </div>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/checks')}>
                        Vai ai Check <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Nutrizione */}
                <AccordionItem value="nutrizione" className="border-border/50">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Apple className="w-5 h-5 text-green-500" />
                      <span>Nutrizione</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-muted-foreground">
                      <p>Qui trovi il piano alimentare caricato dal tuo coach.</p>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Cosa trovi:</p>
                        <ul className="space-y-1.5 pl-4">
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span><strong>Piano alimentare PDF:</strong> Visualizza e scarica il tuo piano direttamente dall'app.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span><strong>Aggiornamenti:</strong> Quando il coach carica un nuovo piano, riceverai una notifica push (se attivate).</span>
                          </li>
                        </ul>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/nutrizione')}>
                        Vai a Nutrizione <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Documenti */}
                <AccordionItem value="documenti" className="border-border/50">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-violet-500" />
                      <span>Documenti</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-muted-foreground">
                      <p>Area dove trovare tutti i documenti condivisi dal tuo coach.</p>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Cosa trovi:</p>
                        <ul className="space-y-1.5 pl-4">
                          <li className="flex items-start gap-2">
                            <span className="text-violet-500 mt-1">•</span>
                            <span><strong>PDF e documenti:</strong> Schede, guide, protocolli e qualsiasi file che il coach condivide con te.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-violet-500 mt-1">•</span>
                            <span><strong>Download:</strong> Puoi scaricare i documenti per consultarli anche offline.</span>
                          </li>
                        </ul>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/documenti')}>
                        Vai ai Documenti <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Allenamento */}
                <AccordionItem value="allenamento" className="border-border/50">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Dumbbell className="w-5 h-5 text-orange-500" />
                      <span>Allenamento & Video</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-muted-foreground">
                      <p>Sezione dedicata all'allenamento con la funzione di correzione video.</p>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Cosa puoi fare:</p>
                        <ul className="space-y-1.5 pl-4">
                          <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span><strong>Carica un video:</strong> Registra un esercizio e caricalo per ricevere feedback dal coach.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span><strong>Feedback coach:</strong> Il coach puo' rispondere con correzioni testuali o video. Riceverai una notifica push!</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span><strong>Pallino rosso:</strong> Se vedi un pallino rosso sull'icona Allenamento nella barra in basso, hai un nuovo feedback da leggere.</span>
                          </li>
                        </ul>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/allenamento')}>
                        Vai ad Allenamento <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Progressi */}
                <AccordionItem value="progressi" className="border-border/50">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      <span>Progressi</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-muted-foreground">
                      <p>Monitora i tuoi progressi nel tempo con grafici e confronti fotografici.</p>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Cosa trovi:</p>
                        <ul className="space-y-1.5 pl-4">
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">•</span>
                            <span><strong>Grafico peso:</strong> L'andamento del tuo peso nel tempo.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">•</span>
                            <span><strong>Confronto foto:</strong> Confronta le foto di check diversi fianco a fianco per vedere i cambiamenti.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">•</span>
                            <span><strong>Storico misurazioni:</strong> Tabella con tutte le misurazioni (peso, vita, fianchi, ecc.).</span>
                          </li>
                        </ul>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/progressi')}>
                        Vai ai Progressi <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Badges */}
                <AccordionItem value="badges" className="border-border/50">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span>Sistema Badges & Streak</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-muted-foreground">
                      <p>Ogni giorno che compili il check-in la tua streak cresce. Piu' giorni consecutivi = badges migliori!</p>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">I livelli:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-muted/30 rounded-lg p-2 text-center text-xs">
                            <div className="text-lg mb-1">🔥</div>
                            <p className="font-medium text-foreground">Scintilla</p>
                            <p>1-2 giorni</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-2 text-center text-xs">
                            <div className="text-lg mb-1">⚡</div>
                            <p className="font-medium text-foreground">Momentum</p>
                            <p>3-6 giorni</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-2 text-center text-xs">
                            <div className="text-lg mb-1">💪</div>
                            <p className="font-medium text-foreground">Costanza</p>
                            <p>7-13 giorni</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-2 text-center text-xs">
                            <div className="text-lg mb-1">🏆</div>
                            <p className="font-medium text-foreground">Leggenda</p>
                            <p>14+ giorni</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs">Tocca la barra dei badges nel Diario per vedere tutti i traguardi!</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Installazione */}
                <AccordionItem value="installazione" className="border-border/50">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-cyan-500" />
                      <span>Installa l'App</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-muted-foreground">
                      <p>362gradi e' una Progressive Web App (PWA): puoi installarla sul telefono come un'app nativa!</p>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Su iPhone (Safari):</p>
                        <ol className="space-y-1.5 pl-4 list-decimal list-inside">
                          <li>Apri l'app in Safari</li>
                          <li>Tocca l'icona di condivisione (quadrato con freccia in su)</li>
                          <li>Scorri e tocca "Aggiungi alla schermata Home"</li>
                          <li>Conferma con "Aggiungi"</li>
                        </ol>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Su Android (Chrome):</p>
                        <ol className="space-y-1.5 pl-4 list-decimal list-inside">
                          <li>Apri l'app in Chrome</li>
                          <li>Tocca i tre puntini in alto a destra</li>
                          <li>Tocca "Installa app" o "Aggiungi alla schermata Home"</li>
                        </ol>
                      </div>
                      <div className="bg-cyan-500/10 rounded-lg p-3 text-xs">
                        <strong>Importante:</strong> Installare l'app e' necessario per ricevere le notifiche push su iPhone!
                      </div>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/install')}>
                        Guida Installazione <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Impostazioni */}
                <AccordionItem value="impostazioni" className="border-b-0">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-500" />
                      <span>Impostazioni</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-muted-foreground">
                      <p>Gestisci il tuo account e le preferenze.</p>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Cosa puoi fare:</p>
                        <ul className="space-y-1.5 pl-4">
                          <li className="flex items-start gap-2">
                            <span className="text-gray-500 mt-1">•</span>
                            <span><strong>Modifica profilo:</strong> Cambia il tuo nome visualizzato.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-500 mt-1">•</span>
                            <span><strong>Cambia password:</strong> Aggiorna la tua password di accesso.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-500 mt-1">•</span>
                            <span><strong>Notifiche push:</strong> Attiva/disattiva le notifiche (vedi sezione in alto).</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-gray-500 mt-1">•</span>
                            <span><strong>Elimina account:</strong> Se necessario, puoi eliminare il tuo account (GDPR Art. 17).</span>
                          </li>
                        </ul>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/settings')}>
                        Vai alle Impostazioni <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </div>
          </motion.section>

          {/* Supporto */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="card-elegant p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-semibold">Hai bisogno di aiuto?</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Se hai domande o problemi con l'app, contatta il tuo coach o scrivi a:
              </p>
              <a
                href="mailto:info@362gradi.it"
                className="text-sm font-medium text-primary hover:underline"
              >
                info@362gradi.it
              </a>
            </div>
          </motion.section>

        </div>
      </div>

      {/* Bottom Dock */}
      <BottomDock />

      <Footer />
    </div>
  );
};

export default Guida;
