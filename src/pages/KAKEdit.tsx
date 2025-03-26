
import { useParams, useNavigate } from "react-router-dom";
import { useKAK } from "@/contexts/KAKContext";
import KAKFormComponent from "@/components/KAKFormComponent";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

const KAKEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { getKAKById, updateKAK } = useKAK();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the KAK data
  const kakData = id ? getKAKById(id) : undefined;
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // If KAK not found, show error and redirect
      if (!kakData && id) {
        toast({
          title: "KAK tidak ditemukan",
          description: `KAK dengan ID ${id} tidak ditemukan`,
          variant: "destructive",
        });
        navigate("/kak");
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [kakData, id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <div className="animate-pulse h-24 w-24 bg-secondary rounded-full mx-auto flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-primary opacity-50"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-6" />
              <path d="m9 15 3 3 3-3" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Memuat Data</h2>
          <p className="text-muted-foreground">Menyiapkan data KAK untuk diedit...</p>
        </div>
      </div>
    );
  }

  // If KAK not found after loading, don't render the form
  if (!kakData) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Kerangka Acuan Kerja</h1>
        <p className="text-muted-foreground">
          Perbarui informasi pada KAK yang sudah ada
        </p>
      </div>
      
      <KAKFormComponent
        initialData={kakData}
        onSave={(formData) => updateKAK({ ...formData, id: kakData.id })}
        mode="edit"
      />
    </div>
  );
};

export default KAKEdit;
