import {
  useLoaderData,
} from "react-router-dom";

function Safe() {
  const data = useLoaderData();

  return (
    <div className="App">
      12345
    </div>
  );
}

export default Safe;