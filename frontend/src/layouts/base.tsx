import { FunctionComponent, ComponentChildren } from "preact";
import Navbar from "./navbar";

interface BaseLayoutProps {
    children: ComponentChildren;
}

const BaseLayout: FunctionComponent<BaseLayoutProps> = ({ children }) => {
    return (
        <div>
            <Navbar />
            {children}
        </div>
    );
};

export default BaseLayout;
