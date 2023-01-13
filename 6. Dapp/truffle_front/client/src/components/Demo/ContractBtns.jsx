import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function ContractBtns({ setValue, setName }) {
  const { state: { contract, accounts } } = useEth();
  const [inputValue, setInputValue] = useState("");
  const [inputName, setInputName] = useState("");

  const handleInputChange = e => {
    if (/^\d+$|^$/.test(e.target.value)) {
      setInputValue(e.target.value);
    }
  };

  const handleInputChangeName = e => {
    setInputName(e.target.value);
  };

  const read = async () => {
    const value = await contract.methods.read().call({ from: accounts[0] });
    setValue(value);
  };

  const write = async e => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (inputValue === "") {
      alert("Please enter a value to write.");
      return;
    }
    const newValue = parseInt(inputValue);
    await contract.methods.write(newValue).send({ from: accounts[0] });
  };

  const getGreeter = async () => {
    const name = await contract.methods.getGreeter().call({ from: accounts[0] });
    setName(name);
  };

  const setGreeter = async e => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (inputName === "") {
      alert("Please enter a name !");
      return;
    }
    const newName = inputName;
    await contract.methods.setGreeter(newName).send({ from: accounts[0] });
  };

  return (
    <div className="btns">

      <button onClick={read}>
        read()
      </button>

      <div onClick={write} className="input-btn">
        write(<input
          type="text"
          placeholder="uint"
          value={inputValue}
          onChange={handleInputChange}
        />)
      </div>

      <button onClick={getGreeter}>
        getGreeter()
      </button>

      <div onClick={setGreeter} className="input-btn">
        setGreeter(<input
          type="text"
          placeholder="name"
          value={inputName}
          onChange={handleInputChangeName}
        />)
      </div>

    </div>
  );
}

export default ContractBtns;
