
import { useKAK } from "@/contexts/KAKContext";
import KAKFormComponent from "@/components/KAKFormComponent";
import { KAK } from "@/contexts/KAKContext";

const KAKFormPage = () => {
  const { addKAK } = useKAK();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Buat Kerangka Acuan Kerja</h1>
        <p className="text-muted-foreground">
          Lengkapi form berikut untuk membuat KAK baru
        </p>
      </div>
      
      <KAKFormComponent
        onSave={(kakData: Omit<KAK, "id">) => addKAK(kakData)}
        mode="create"
      />
    </div>
  );
};

export default KAKFormPage;
