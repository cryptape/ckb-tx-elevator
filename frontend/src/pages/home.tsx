import { useState } from "preact/hooks";
import Elevator from "../components/elevator";
import Ground from "../components/ground";
import SpaceBanner from "../components/space-banner";
import BaseLayout from "../layouts/base";
import Pool from "../components/pool";
import Switcher from "../components/switcher";

export function Home() {
    const [showElevator, setShowElevator] = useState(true);

    return (
        <BaseLayout>
            <SpaceBanner />
            <Switcher
                onSwitch={(view) => setShowElevator(view === "elevator")}
            />
            <div class="h-[2200px] relative" style={{ perspective: "1000px" }}>
                <div
                    class={`transition-transform duration-1000 ease-out origin-top`}
                    style={{
                        transformStyle: "preserve-3d",
                        transform: !showElevator ? "rotateX(-180deg)" : "",
                    }}
                >
                    {/* Elevator 面 */}
                    <div
                        class="absolute w-full h-full"
                        style={{
                            backfaceVisibility: "hidden",
                            transform: "translateZ(1px)",
                        }}
                    >
                        <Elevator />
                        <Ground />
                    </div>

                    {/* Pool 面 */}
                    <div
                        class="absolute w-full h-full"
                        style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateX(180deg) translateZ(1px)",
                        }}
                    >
                        <Pool />
                        <Ground />
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
}
