import { FunctionalComponent } from "preact";

export interface SignBoardProp {
    title: string;
    count: number;
}
export const SignBoard: FunctionalComponent<SignBoardProp> = ({
    title,
    count,
}) => {
    return (
        <div className={"relative"}>
            <img src={"/assets/svg/pool/signboard.svg"} alt="" />
            <div
                className={
                    "absolute text-text-primary bottom-[8px] left-1/2 -translate-x-1/2"
                }
            >
                {title} {count}
            </div>
        </div>
    );
};
