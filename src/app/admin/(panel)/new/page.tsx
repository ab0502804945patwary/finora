import { docTypes } from "@/lib/config";
import { NewDocForm } from "./NewDocForm";

export default function NewDocPage() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="t-h1">Issue Document</h1>
      <p className="mt-2 max-w-xl t-body text-sm">
        Upload the final PDF. A QR code and verification ID are stamped on it and its SHA-256 fingerprint is recorded.
        You will download the stamped PDF on the next screen.
      </p>
      <NewDocForm docTypes={[...docTypes]} today={today} />
    </div>
  );
}
