import { useState } from "react";
import UploadAudio from "../components/UploadAudio";
import ResultCard from "../components/ResultCard";

function Home() {
  const [result, setResult] = useState<any>(null);

  return (
    <div>
      <UploadAudio setResult={setResult} />
      <ResultCard result={result} />
    </div>
  );
}

export default Home;