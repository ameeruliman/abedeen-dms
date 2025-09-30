import Layout from "@/components/Layout";
import Image from "next/image";

export default function QRPortalPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6 text-black">
          <h1 className="text-3xl font-bold">QR Portal</h1>
          <p className="text-purple-600">
            Scan QR codes for quick access to all facilities
          </p>
        </div>

        {/* QR Image */}
        <div className="flex justify-center">
          <div className="w-full max-w-7xl bg-white p-5 rounded-2xl shadow-lg">
            <Image
              src="/Abedeen QR Portal .png"
              alt="QR Codes for All Facilities"
              width={2400}
              height={1800}
              quality={100}
              priority
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
