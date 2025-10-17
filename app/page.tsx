import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Lock, Github, Code2, Cloud, Smartphone } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">MyBB</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/app">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
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
                <Link href="/app">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
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
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 border border-blue-500/20">
                <div className="space-y-4">
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <div className="text-sm font-mono text-muted-foreground mb-2">{'Command: /calculate'}</div>
                    <div className="text-sm font-mono text-foreground">
                      <span className="text-green-500">const</span> result = <span className="text-blue-500">2</span> +{" "}
                      <span className="text-blue-500">2</span>
                    </div>
                    <div className="text-sm font-mono text-foreground">
                      Bot.<span className="text-yellow-500">sendMessage</span>(result)
                    </div>
                  </div>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <div className="text-sm font-mono text-green-500">✓ Result: 4</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">Everything you need to build amazing Telegram bots</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background rounded-xl p-8 border border-border hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">BJS Scripting</h3>
              <p className="text-muted-foreground">
                Write bot logic with Bot JavaScript. Use all standard JS functions for powerful automation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background rounded-xl p-8 border border-border hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Github className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">GitHub Sync</h3>
              <p className="text-muted-foreground">
                Import code from GitHub repositories. Keep your bot code in sync with your repository.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background rounded-xl p-8 border border-border hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Cloud className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cloud Hosted</h3>
              <p className="text-muted-foreground">
                Your bot runs in the cloud 24/7. No hosting, no database, no certificates needed.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-background rounded-xl p-8 border border-border hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your data is safe. No backend storage. Everything managed securely by MyBB infrastructure.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-background rounded-xl p-8 border border-border hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Web & Mobile</h3>
              <p className="text-muted-foreground">
                Build and manage your bots from web or mobile app. Full control wherever you are.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-background rounded-xl p-8 border border-border hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Always Online</h3>
              <p className="text-muted-foreground">
                Your bot never sleeps. Runs continuously in the cloud with 99.9% uptime guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Get your bot running in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Bot",
                description: "Write your bot commands using BJS scripting. No complex setup required.",
              },
              {
                step: "2",
                title: "Connect to Telegram",
                description: "Link your bot to Telegram using your bot token. Takes just one click.",
              },
              {
                step: "3",
                title: "Deploy & Scale",
                description: "Your bot is instantly live and running in the cloud. Scale without limits.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-background rounded-xl p-8 border border-border">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">CC</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Built by i am cc</h2>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            MyBB is built single-handedly with passion for making bot development accessible to everyone. No corporate
            backing, no data harvesting. Your privacy and security are paramount.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="https://t.me/nirjon" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                Follow on Telegram
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                View on GitHub
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Build Your Bot?</h2>
          <p className="text-lg mb-8 opacity-90">
            Start creating powerful Telegram bots today. Free forever, no credit card required.
          </p>
          <Link href="/app">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Started Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">MyBB</span>
              </div>
              <p className="text-sm text-muted-foreground">Build Telegram bots with ease</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Features
                  </a>
                </li>
                <li>
                  
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Docs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://t.me/nirjon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition"
                  >
                    Telegram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Help
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
                <li>
                  
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© 2025 MyBB. Built with ❤️ by i am cc</p>
            
          </div>
        </div>
      </footer>
    </div>
  )
}
