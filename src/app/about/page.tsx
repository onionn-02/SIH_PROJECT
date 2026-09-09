import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarClock,
  Languages,
  Mail,
  Phone,
  Radar,
} from "lucide-react";

const features = [
  {
    icon: CalendarClock,
    title: "Book a convenient slot",
    description:
      "Choose a procurement centre and time slot that works for you, instead of showing up and waiting.",
  },
  {
    icon: Radar,
    title: "Live queue & status tracking",
    description:
      "Follow your crop's journey from arrival to weighing, quality check, procurement and payment in real time.",
  },
  {
    icon: Languages,
    title: "Voice & regional-language support",
    description:
      "A simple, accessible interface designed for farmers of all technical backgrounds.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <PageHeader
        title="About FasalFlow"
        description="FasalFlow is a farmer-first digital procurement platform designed to make the crop procurement process simpler, faster, and more transparent."
      />

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Farmers often face long waiting times, uncertain procurement
          schedules, repeated visits to centres, and limited information
          about the status of their crop. FasalFlow addresses these
          challenges by bringing the entire procurement journey into one
          easy-to-use platform.
        </p>
        <p>
          With FasalFlow, farmers can book a convenient procurement slot,
          choose a suitable procurement centre, view live queue information,
          and track their crop&apos;s progress from arrival to weighing,
          quality checking, procurement, and payment. The platform also
          provides timely updates and notifications, helping farmers plan
          their visit instead of spending hours waiting at the centre.
        </p>
        <p>
          Designed with accessibility in mind, FasalFlow focuses on a
          simple, intuitive interface with voice assistance and
          regional-language support, making digital procurement easier to
          understand and use.
        </p>
        <p className="font-medium text-foreground">
          Our goal is simple: reduce unnecessary waiting, improve
          transparency, and give farmers greater control over their
          procurement journey.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <feature.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <CardTitle className="text-base">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-center text-lg font-semibold text-foreground">
        FasalFlow — Your harvest. Your time. Your choice.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">For queries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <a
            href="mailto:priyaltembhre2618@gmail.com"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <Mail className="h-4 w-4 shrink-0" />
            priyaltembhre2618@gmail.com
          </a>
          <a
            href="tel:+918871764344"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4 shrink-0" />
            8871764344
          </a>
          <a
            href="mailto:aryanhingane002@gmail.com"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <Mail className="h-4 w-4 shrink-0" />
            aryanhingane002@gmail.com
          </a>
          <a
            href="tel:+917028324646"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <Phone className="h-4 w-4 shrink-0" />
            7028324646
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
