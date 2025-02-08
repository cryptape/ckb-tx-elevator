import { useState } from "preact/hooks";
import Elevator from "../components/elevator";
import Ground from "../components/ground";
import SpaceBanner from "../components/space-banner";
import BaseLayout from "../layouts/base";
import Pool from "../components/pool";
import Switcher from "../components/switcher";

export function Home() {
    const [isNewBlock, setIsNewBlock] = useState(false);

    return (
        <BaseLayout>
            <SpaceBanner isToTheMoon={isNewBlock} />
            <Switcher
                front={
                    <>
                        <Elevator setIsNewBlock={setIsNewBlock} />
                        <Ground />
                    </>
                }
                back={
                    <>
                        <Pool />
                        <Ground />
                    </>
                }
            />
        </BaseLayout>
    );
}
