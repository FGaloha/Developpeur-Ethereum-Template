import { useRef, useEffect, useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function Contract({ value, name }) {
  const [EventValue, setEventValue] = useState("");
  const [oldEventsValue, setOldEventsValue] = useState();
  const [EventName, setEventName] = useState("");
  const [oldEventsName, setOldEventsName] = useState();

  const { state: { contract } } = useEth();

  useEffect(() => {
    (async function () {

      let oldEventsValue = await contract.getPastEvents('valueChanged', {
        fromBlock: 0,
        toBlock: 'latest'
      });
      let oldiesValues = [];
      oldEventsValue.forEach(event => {
        oldiesValues.push(event.returnValues._value);
      });
      setOldEventsValue(oldiesValues);

      await contract.events.valueChanged({ fromBlock: "earliest" })
        .on('data', event => {
          let lesevents = event.returnValues._value;
          setEventValue(lesevents);
        })
        .on('changed', changed => console.log(changed))
        .on('error', err => console.log(err))
        .on('connected', str => console.log(str))
    })();
  }, [contract])

  useEffect(() => {
    (async function () {

      let oldEventsName = await contract.getPastEvents('nameChanged', {
        fromBlock: 0,
        toBlock: 'latest'
      });
      let oldiesNames = [];
      oldEventsName.forEach(event => {
        oldiesNames.push(event.returnValues._name);
      });
      setOldEventsName(oldiesNames);

      await contract.events.nameChanged({ fromBlock: "earliest" })
        .on('data', event => {
          let leseventsName = event.returnValues._name;
          setEventName(leseventsName);
        })
        .on('changed', changed => console.log(changed))
        .on('error', err => console.log(err))
        .on('connected', str => console.log(str))
    })();
  }, [contract])

  const spanEle1 = useRef(null);

  useEffect(() => {
    spanEle1.current.classList.add("flash");
    const flash = setTimeout(() => {
      spanEle1.current.classList.remove("flash");
    }, 300);
    return () => {
      clearTimeout(flash);
    };
  }, [value]);

  const spanEle2 = useRef(null);

  useEffect(() => {
    spanEle2.current.classList.add("flash");
    const flash = setTimeout(() => {
      spanEle2.current.classList.remove("flash");
    }, 300);
    return () => {
      clearTimeout(flash);
    };
  }, [name]);

  return (
    <code>
      {`contract SimpleStorage {
  uint256 value = `}

      <span className="secondary-color" ref={spanEle1}>
        <strong>{value}</strong>
      </span>

      {`;

  string internal name = `}

      <span className="secondary-color" ref={spanEle2}>
        <strong>{name}</strong>
      </span>

      {`;

  function read() public view returns (uint256) {
    return value;
  }

  function write(uint256 newValue) public {
    value = newValue;
  }

  function setGreeter(string calldata _name) public {
    name = _name;
  }

  function getGreeter() public view returns (string memory) {
    return string.concat("Hello Mister ", name);
  }
}

  Event arriving: `} {EventValue} {`

  Old events values: `} {oldEventsValue} {`

  Name arriving: `} {EventName} {`

  Old events names: `} {oldEventsName}
    </code>
  );
}

export default Contract;
