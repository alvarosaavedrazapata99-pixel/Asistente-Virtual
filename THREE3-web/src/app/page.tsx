import { ComoFunciona, Footer, Header, Hero, Instagram, Personaje, Servicios } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Servicios />
        <ComoFunciona />
        <Personaje />
        <Instagram />
      </main>
      <Footer />
    </>
  );
}
