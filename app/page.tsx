import { Deck } from "@/components/home/Deck";
import { Finale } from "@/components/home/Finale";
import { Hero } from "@/components/home/Hero";
import { HomeScene } from "@/components/home/HomeScene";
import { Instruments } from "@/components/home/Instruments";
import { LabRail } from "@/components/home/LabRail";
import { LogTerminal } from "@/components/home/LogTerminal";
import { Method } from "@/components/home/Method";
import { Process } from "@/components/home/Process";

export default function Home() {
  return (
    <>
      <HomeScene />
      <Hero />
      <Process />
      <Instruments />
      <Deck />
      <LabRail />
      <Method />
      <LogTerminal />
      <Finale />
    </>
  );
}
