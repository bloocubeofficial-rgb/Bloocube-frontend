"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AiVideoModal from "@/Components/AiVideoGenerator/AiVideoModal";

export default function BrandAiVideoPage() {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const router = useRouter();

    // Open modal when component mounts
    useEffect(() => {
        setIsModalOpen(true);
    }, []);

    const handleClose = () => {
        setIsModalOpen(false);
        // Redirect back to brand overview when modal closes
        router.push('/brand');
    };

    return (
        <div className="h-full">
            <AiVideoModal isOpen={isModalOpen} onClose={handleClose} />
        </div>
    );
}

