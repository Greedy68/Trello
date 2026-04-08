import Board from "@/components/Board";

async function getBoard(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/boards/${id}`, {
        cache: 'no-store' 
    });

    if (!res.ok) return null;
    return res.json();
}

export default async function BoardPage({ params }) {
    const { id } = await params;
    const board = await getBoard(id);

    if (!board) return <div className="p-10 text-center">Không tìm thấy bảng...</div>;

    return (
        <div className="h-full w-full">
            <Board board={board} />
        </div>
    );
}