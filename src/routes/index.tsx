import { createFileRoute } from "@tanstack/react-router";
import {
  FinalCta,
  Hero,
  Process,
  Testimonials,
  WhyStackweb,
  Work,
} from "@/components/site/sections";

const title = "Stackweb — Custom websites, built on demand";
const description =
  "Stackweb is a web design studio building custom, high-performance websites for brands that care how they look. See selected work and start a project.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Process />
      <WhyStackweb />
      <Testimonials />
      <FinalCta />
    </>
  );
}
