import { FunctionalComponent } from "preact";

interface CapacityItem {
    label: string;
    value: string;
}

const ElevatorCapacity: FunctionalComponent = () => {
    const size = "597,000";
    const cycles = "3.5 billion";

    return (
        <div class="rounded-lg overflow-hidden border-2 border-surface-DEFAULT-inverse shadow-md max-w-sm mx-auto">
            {/* 标题部分 */}
            <div class="text-center text-brand-accent px-3 py-4 bg-surface-DEFAULT-inverse">
                <h4 class="uppercase">
                    Elevator <br /> Capacity
                </h4>
            </div>

            {/* 容量数据部分 */}
            <div class="bg-brand-accent space-y-1  px-3 py-4">
                <h3>
                    <span>{size} bytes</span>
                    <br />
                    <span>{cycles} cycles</span>
                </h3>
            </div>
        </div>
    );
};

export default ElevatorCapacity;
