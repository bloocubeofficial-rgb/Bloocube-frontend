"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AiVideoModal from "@/Components/AiVideoGenerator/AiVideoModal";

export default function CreatorAiVideoPage() {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const router = useRouter();

    // Open modal when component mounts
    useEffect(() => {
        setIsModalOpen(true);
    }, []);

    const handleClose = () => {
        setIsModalOpen(false);
        // Redirect back to creator overview when modal closes
        router.push('/creator');
    };

    return (
        <div className="h-full">
            <AiVideoModal isOpen={isModalOpen} onClose={handleClose} />
        </div>
    );
}

