import { Class as ClassDetailsType } from "@/data/mockData";

const ClassDetails: React.FC<{ c: ClassDetailsType }> = ({ c }) => {
  return (
    <div style={{ display: "flex", marginBottom: "20px" }}>
      <div style={{ marginLeft: "auto", textAlign: "right" }}>
        <button style={{ padding: "10px", backgroundColor: "#007bff", color: "#fff", border: "none" }}>
          View PDF
        </button>
      </div>
    </div>
  );
};

export default ClassDetails;