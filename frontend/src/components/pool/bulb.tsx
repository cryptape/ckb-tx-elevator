import { h } from "preact";
import { FunctionalComponent } from "preact";

export interface BulbProps {
    bulbColor?: string;
    isOn?: boolean;
}

export const Bulb: FunctionalComponent<BulbProps> = ({
    bulbColor = "bg-functionality-error",
    isOn = false,
}) => {
    const bulbStyle = `rounded-full border-2 border-black w-7 h-7 flex items-center justify-center transition-colors duration-300 ${isOn ? bulbColor : "bg-functional-error"}`;

    return (
        <div className="flex flex-col items-center">
            <div className={bulbStyle}></div>

            <div className="flex flex-col items-center mt-2">
                <div className="flex">
                    <span
                        className="rounded-full bg-black inline-block m-0.5"
                        style={{ width: "0.5em", height: "0.5em" }}
                    ></span>
                    <span
                        className="rounded-full bg-black inline-block m-0.5"
                        style={{ width: "0.5em", height: "0.5em" }}
                    ></span>
                </div>
                <div className="flex">
                    <span
                        className="rounded-full bg-black inline-block m-0.5"
                        style={{ width: "0.5em", height: "0.5em" }}
                    ></span>
                    <span
                        className="rounded-full bg-black inline-block m-0.5"
                        style={{ width: "0.5em", height: "0.5em" }}
                    ></span>
                </div>
                <div className="flex">
                    <span
                        className="rounded-full bg-black inline-block m-0.5"
                        style={{ width: "0.5em", height: "0.5em" }}
                    ></span>
                    <span
                        className="rounded-full bg-black inline-block m-0.5"
                        style={{ width: "0.5em", height: "0.5em" }}
                    ></span>
                </div>
            </div>
        </div>
    );
};

export default Bulb;
