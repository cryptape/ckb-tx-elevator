import Elevator from "../components/elevator";
import Ground from "../components/ground";
import InfoHeader from "../components/info-header";
import SearchComponent from "../components/search";
import BaseLayout from "../layouts/base";

export function Home() {
    return (
        <BaseLayout>
            <InfoHeader />
            <SearchComponent />
            <Elevator />
            <Ground />
        </BaseLayout>
    );
}
