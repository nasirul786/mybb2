"use client"

import { useState } from "react" // Import useState for accordion
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowRight, Zap, Lock, Code2, Cloud, Smartphone, HelpCircle, Mail, MessageCircle, Download as DownloadIcon, Star, Users, Check, Bot } from "lucide-react"
import Link from "next/link"

// Helper function to format large numbers
const short = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K` // Use K for thousands without decimal
  return `${n}`
}

// Google Play Store Icon SVG
const GooglePlayIcon = () => (
  <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.531 11.148l-1.996-1.152-4.238 4.238 4.195 4.195c.571-.341.98-.86.98-1.543v-5.738zm-11.454-9.352l-7.281 7.281c-.341.571-.512 1.284-.512 1.996v.043l8.608-8.608-.815-.712zm8.608 8.608l-8.608 8.608c.712.17.1425.213.1996.213h.043l7.281-7.281-7.126-7.126zm-9.352 11.454l-1.152-1.996 4.238-4.238 4.195 4.195-5.738.98c-.683 0-1.203-.411-1.543-.94zm11.541-11.191l-9.982 9.982 9.982 9.982c2.482-1.067 4.195-3.585 4.195-6.421s-1.713-5.354-4.195-6.543z"/>
  </svg>
);


export default function Home() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null); // State for accordion

  const handleFaqToggle = (index: number) => {
    setOpenFaqIndex(prevIndex => (prevIndex === index ? null : index));
  };


  const pricingPlans = [
    { name: "Free without Ads", iterations: 4000, price: 0 },
    { name: "Free with Ads", iterations: 300000, price: 0 },
    { name: "Cloud.Hobby", iterations: 1000000, price: 15 },
    { name: "Cloud.Nano", iterations: 2000000, price: 28 },
    { name: "Cloud.Mini", iterations: 5000000, price: 48 },
    { name: "Cloud.Start", iterations: 10000000, price: 95 },
    { name: "Cloud.PRO", iterations: 45000000, price: 180 },
    { name: "Cloud.Business", iterations: 100000000, price: 270 },
    { name: "Cloud.Big Business", iterations: 200000000, price: 400 },
  ]

  const features = [
     { icon: Zap, title: "Fast & always on", description: "Bot runs in the cloud. You can power off the phone." },
     { icon: Code2, title: "Easily Editable", description: "Edit commands in a simple way." },
     { icon: DownloadIcon, title: "Commands importing", description: "Do you have Google Table file? Create bot from this table." },
     { icon: Code2, title: "Github Sync", description: "Import the code from Github or other repositories. You can also export." },
     { icon: Smartphone, title: "Desktop and mobile", description: "Use web app and mobile app. As you wish" },
     { icon: Code2, title: "BJS for logic", description: "Use Bot Java Script for logic in command." },
  ]

  const faqs = [
    { q: "What it is \"BJS\"?", a: "It is Bot JavaScript. It's an ordinary JavaScript with some inserts. Commands can have scenarios with BJS code. Example: Calculating 2+2 and sending the result to the chat - that's BJS code. You can use all usual JS functions except setTimeout and setInterval." },
    { q: "How can I get two answers from one command?", a: "You can use the bot's default answer field and also use Bot.sendMessage(\"ANY message\"). Or use Bot.sendMessage twice within your BJS code." },
    { q: "How can I study bot development?", a: "See Demo Bots in the Store, explore examples in the Help documentation, and ask questions in the help chat." },
    // Adding back original FAQs
    { q: "How to transfer bot to another user?", a: "Please contact administration in help chat for this." },
    { q: "Can I use external libraries?", a: "Yes, you can use built-in libraries like moment.js, request, cheerio and underscore.js. Also you can create your own library and use it in several bots." },
    { q: "What is Bot Java Script (BJS)?", a: "It's an ordinary JavaScript with some built-in helpers (API, Bot, User, etc.). Commands can have scenarios with BJS code. Example: Calculating 2+2 and sending the result to the chat - it is BJS code. In BJS, you can use all the usual JS functions except setTimeout, setInterval." },

  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Bots.Business</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/app">
              <Button variant="ghost" className="cursor-pointer">
                Log in
              </Button>
            </Link>
            <Link href="/app?mode=new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl font-bold leading-tight text-balance">
                  Build Telegram bots in minutes
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Free forever. No hosting needed. No credit card required. Create powerful Telegram bots with BJS
                  scripting, GitHub sync, and deploy instantly to the cloud.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/app?mode=new">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto cursor-pointer"
                  >
                    Start Building Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Trusted by developers worldwide</p>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">End-to-end secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Always online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Cloud hosted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 border border-blue-500/20 shadow-lg">
                <div className="space-y-4">
                  <div className="bg-card rounded-lg p-4 border border-border/50 shadow-inner">
                    <div className="text-xs font-mono text-muted-foreground mb-2">{"> Command: /calculate"}</div>
                    <pre className="text-sm font-mono text-foreground leading-relaxed"><code>
                      <span className="text-purple-400">const</span> result = <span className="text-teal-400">2</span> + <span className="text-teal-400">2</span>{'\n'}
                      Bot.<span className="text-yellow-400">sendMessage</span>(result)
                    </code></pre>
                  </div>
                   <div className="bg-card rounded-lg p-4 border border-border/50 shadow-inner">
                     <pre className="text-sm font-mono text-green-400"><code>✓ Result: 4</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to build amazing Telegram bots efficiently.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-colors duration-200 hover:shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

           {/* Testimonials */}
           <div className="text-center">
             <h3 className="text-2xl font-semibold mb-4">Trusted by the Community</h3>
             <p className="text-lg text-muted-foreground mb-6">Over 500k+ downloads from Play Market</p> {/* Updated User Count */}
             <div className="flex items-center justify-center gap-4">
               <div className="flex items-center gap-1 text-yellow-400">
                 <Star className="w-5 h-5 fill-current" />
                 <Star className="w-5 h-5 fill-current" />
                 <Star className="w-5 h-5 fill-current" />
                 <Star className="w-5 h-5 fill-current" />
                 <Star className="w-5 h-5 fill-yellow-400/50" /> {/* Example for 4.6 */}
               </div>
               <span className="font-semibold text-lg">4.6</span>
               <span className="text-muted-foreground">stars from</span>
               <span className="font-semibold text-lg flex items-center gap-1"> <Users className="w-4 h-4"/> 925+</span>
               <span className="text-muted-foreground">users</span>
             </div>
           </div>

        </div>
      </section>

       {/* Pricing Section */}
       <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
             <h2 className="text-4xl font-bold mb-4">Pricing Plan</h2>
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Our Awesome Pricing Plan. Choose the perfect fit for your needs.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
             {pricingPlans.map((plan, index) => (
               <Card key={index} className="flex flex-col border border-border/50 hover:border-primary/30 transition-colors duration-200 hover:shadow-lg">
                 <CardHeader className="pb-4">
                   <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                   <p className="text-sm text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3"/> {short(plan.iterations)} iterations / month</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Bot className="w-3 h-3"/> Unlimited bots count</p>
                 </CardHeader>
                 <CardContent className="flex-grow flex flex-col justify-between">
                   <div className="mb-6">
                     <span className="text-4xl font-bold">${plan.price}</span>
                     <span className="text-muted-foreground">/Month</span>
                   </div>
                   <Link href="/app?mode=new" className="w-full">
                     <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                       Start now
                       <ArrowRight className="w-4 h-4 ml-2" />
                     </Button>
                   </Link>
                 </CardContent>
               </Card>
             ))}
           </div>
           <div className="mt-12 text-center text-muted-foreground text-sm max-w-2xl mx-auto p-4 border rounded-lg bg-muted/30">
             <h4 className="font-semibold text-foreground mb-1">What is an iteration?</h4>
             <p>An action (e.g., receiving a message or an Auto Retry call) is counted as one iteration, regardless of the number of messages or actions executed in response.</p>
           </div>
         </div>
       </section>

       {/* FAQs Section - Updated with Accordion */}
       <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
         <div className="max-w-4xl mx-auto">
           <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
           <div className="space-y-4"> {/* Adjusted spacing */}
             {faqs.map((faq, index) => (
               <Card key={index} className="overflow-hidden border border-border/50">
                 {/* Use open attribute controlled by state */}
                 <details open={openFaqIndex === index} onToggle={(e) => {
                     // Prevent default toggle, handle it manually
                     e.preventDefault();
                     // Only toggle if the click was on the summary
                     if (e.target instanceof HTMLElement && e.target.tagName === 'SUMMARY') {
                         handleFaqToggle(index);
                     } else if (e.target instanceof HTMLElement && e.target.closest('summary')) {
                          handleFaqToggle(index); // Allow clicks on children of summary
                     }
                 }}>
                   <summary
                     className="flex items-center justify-between p-4 cursor-pointer marker:content-[''] list-none hover:bg-muted/50 transition-colors"
                     onClick={() => handleFaqToggle(index)} // Use onClick on summary for better control
                   >
                     <span className="font-medium select-none">{faq.q}</span>
                     <HelpCircle className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${openFaqIndex === index ? 'rotate-180' : ''}`} />
                   </summary>
                   {/* Content is only rendered when open */}
                   {openFaqIndex === index && (
                      <div className="p-4 border-t text-muted-foreground text-sm bg-background">
                        {faq.a}
                      </div>
                   )}
                 </details>
               </Card>
             ))}
           </div>
         </div>
       </section>


       {/* Download Section */}
       <section className="py-20 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto">
           <div className="grid md:grid-cols-2 gap-12 items-center bg-card p-8 md:p-12 rounded-xl border border-border/50 shadow-sm">
             <div>
               <h2 className="text-3xl font-bold mb-4">Get the Mobile App</h2>
               <p className="text-muted-foreground mb-6">Manage your bots on the go with our native Android application, available on the Google Play Store.</p>
               <a href="https://play.google.com/store/apps/details?id=bb_app.com.bots.business&utm_source=bots.business&utm_medium=website&utm_campaign=download" target="_blank" rel="noopener noreferrer">
                 <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white cursor-pointer inline-flex items-center">
                   <GooglePlayIcon /> {/* Added Icon */}
                   Download on Play Store
                 </Button>
               </a>
             </div>
             <div className="hidden md:flex items-center justify-center">
               <Smartphone className="w-48 h-48 text-primary opacity-20" />
             </div>
           </div>
         </div>
       </section>

       {/* Contact Section */}
       <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
         <div className="max-w-4xl mx-auto text-center">
           <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
           <p className="text-lg text-muted-foreground mb-10">Find Us By Bellow Details</p>
           <div className="flex flex-col sm:flex-row justify-center gap-8">
             <a href="https://t.me/chatbotsbusiness" target="_blank" rel="noopener noreferrer" className="group flex-1"> {/* Added flex-1 */}
               <Card className="p-6 h-full border border-border/50 group-hover:border-primary/30 transition-colors duration-200 group-hover:shadow-sm flex flex-col items-center justify-center"> {/* Added h-full and justify-center */}
                  <MessageCircle className="w-10 h-10 text-primary mb-3" />
                 <h3 className="font-semibold mb-1">Help Chat</h3>
                 <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Telegram</p>
               </Card>
             </a>
             <a href="mailto:hello@bots.business" className="group flex-1"> {/* Added flex-1 */}
                <Card className="p-6 h-full border border-border/50 group-hover:border-primary/30 transition-colors duration-200 group-hover:shadow-sm flex flex-col items-center justify-center"> {/* Added h-full and justify-center */}
                 <Mail className="w-10 h-10 text-primary mb-3" />
                 <h3 className="font-semibold mb-1">E-mail</h3>
                 <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">hello@bots.business</p>
               </Card>
             </a>
           </div>
         </div>
       </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center text-white shadow-xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Build Your Bot?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
            Start creating powerful Telegram bots today. Free forever, no credit card required.
          </p>
          <Link href="/app?mode=new">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 cursor-pointer shadow-md hover:shadow-lg transition-shadow">
              Get Started Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">Bots.Business</span>
              </div>
              <p className="text-sm text-muted-foreground">Build Telegram bots with ease</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground/90">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition">Pricing</Link></li>
                <li><a href="https://help.bots.business/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition">Docs</a></li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold mb-4 text-foreground/90">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                 <li><a href="https://t.me/chatbotsbusiness" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition">Telegram Chat</a></li>
                 <li><a href="https://status.bots.business/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition">Status Page</a></li>
                 <li><a href="https://dev.bots.business/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground/90">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://bots.business/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition">Privacy Policy</a></li>
                <li><a href="https://bots.business/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Bots.Business</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

