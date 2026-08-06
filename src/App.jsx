import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Plans from "./components/Plans";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Plans />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}