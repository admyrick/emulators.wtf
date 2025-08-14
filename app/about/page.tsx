import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Users, Code, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container px-4 py-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Emulators.wtf</h1>
        <p className="text-xl text-muted-foreground">
          Your ultimate destination for emulation resources and community knowledge
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To create the most comprehensive and user-friendly database of emulation resources, helping preserve
              gaming history and making retro gaming accessible to everyone.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Driven
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Built by and for the emulation community. We rely on contributions from passionate gamers and developers
              to keep our database accurate and up-to-date.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Open Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our platform is built with modern web technologies and is completely open source. Contributions,
              suggestions, and feedback are always welcome.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Free Forever
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We believe emulation resources should be freely accessible to everyone. Our platform will always remain
              free and ad-free.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Comprehensive Database</h3>
            <p className="text-muted-foreground mb-4">
              Thousands of emulators, games, tools, and resources across all major gaming platforms.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Advanced Search</h3>
            <p className="text-muted-foreground mb-4">
              Find exactly what you're looking for with our powerful search and filtering system.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Regular Updates</h3>
            <p className="text-muted-foreground mb-4">
              Our database is constantly updated with new releases and improvements.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Mobile Friendly</h3>
            <p className="text-muted-foreground mb-4">
              Access our database from any device with our responsive design.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Next.js 14</Badge>
          <Badge variant="secondary">React</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="secondary">Tailwind CSS</Badge>
          <Badge variant="secondary">Supabase</Badge>
          <Badge variant="secondary">PostgreSQL</Badge>
          <Badge variant="secondary">Vercel</Badge>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Get Involved</h2>
        <p className="text-muted-foreground mb-6">
          Want to contribute to the project? We'd love to have you join our community!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://github.com/yourusername/emulators-wtf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Code className="w-4 h-4 mr-2" />
            View on GitHub
          </a>
          <a
            href="mailto:contact@emulators.wtf"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}
