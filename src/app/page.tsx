import GameFlow from "@/components/game/GameFlow";
import GameScene from "@/components/game/GameScene";

export default function Home() {
    return (
        <main
            className="
                h-screen
                w-screen
                overflow-hidden
                bg-black
            "
        >
            <GameFlow />
        </main>
    );
}