import "./styles.css";
import React, {
  useContext,
  useEffect,
  useState,
  useReducer,
  useRef
} from "react";

//todo:
//what if we get indexes without specifying them but via map
//[reduce properties and code by] useEffect in Tabs, watching selected index and doing all necessary updates in state
//follow step by step Kent's article on useReducer - implement the undo example
//take a look at useReducer - google useReducer plus useContext = magic
//create tab with some stateful component inside to check state is preserved after tab switch
//play with useCallback and useMemo
//store state either in context or in local storage - and wrap in hook
//or try use portal

const TabsContext = React.createContext();

const useTabsContext = () => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("Tab component can only be rendered inside Tabs component");
  }

  return context;
};

const HiddenWrapper = ({ isVisible, children }) => {
  const className = isVisible ? "" : "invisible";

  return <div className={className}>{children}</div>;
};

function Tabs(props) {
  const countRef = useRef(0);
  console.log("tabs");

  const { onTabSelect, children, selectedIndex = 0 } = props;
  const [selectedTabIndex, setSelectedTabIndex] = useState(selectedIndex);

  return (
    <TabsContext.Provider
      value={{
        onTabSelect,
        selectedTabIndex,
        setSelectedTabIndex,
        requestIndex: () => {
          return countRef.current++;
        }
      }}
    >
      <>
        <div className="wrap-tabs">
          {children.map((child, index) => {
            return React.cloneElement(child, { index: index, key: index });
          })}
        </div>
        <div>
          {children.map((child, index) => {
            return (
              <HiddenWrapper isVisible={index === selectedTabIndex} key={index}>
                {child.props.children}
              </HiddenWrapper>
            );
          })}
        </div>
      </>
    </TabsContext.Provider>
  );
}

const TabContent0 = ({ text }) => {
  return <div>{text}</div>;
};

const TabContent1 = () => {
  return (
    <>
      <div>TabContent1</div>
      <ul>
        <li>0</li>
        <li>1</li>
        <li>2</li>
      </ul>
    </>
  );
};

function init(initialCount) {
  return {
    count: initialCount
  };
}

function counterReducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return init(action.payload);
    default:
      throw new Error();
  }
}

function Counter({ initialCount }) {
  const [state, dispatch] = useReducer(counterReducer, initialCount, init);

  return (
    <>
      Count: {state.count}
      <button
        onClick={() => {
          dispatch({ type: "reset", payload: 5 });
        }}
      >
        Reset
      </button>
      <button
        onClick={() => {
          dispatch({ type: "increment" });
        }}
      >
        +
      </button>
      <button
        onClick={() => {
          dispatch({ type: "decrement" });
        }}
      >
        -
      </button>
    </>
  );
}

const StatefulComponent = () => {
  return <Counter initialCount={7} />;
};

function Tab({ header, index }) {
  const {
    onTabSelect,
    selectedTabIndex,
    setSelectedTabIndex
  } = useTabsContext();

  //here we use context as a server and ask for an index
  //and it is neither in prop nor in state
  //we can use Symbol for this - to hash indexes in the context, ha ha ha I am genious )))
  //open question - whether it is better in Tabs component
  //to use React.createElement/cloneElement and add index as a prop during children.map
  //still this will be an implicit prop

  const tabObject = {
    index
  };

  const className =
    index === selectedTabIndex ? `wrap-tab wrap-tab-selected` : `wrap-tab`;

  return (
    <div
      className={className}
      onClick={() => {
        if (index === selectedTabIndex) {
          return;
        }

        setSelectedTabIndex(index);
        onTabSelect(tabObject);
      }}
    >
      <div className="tab-header">{header}</div>
    </div>
  );
}

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <Tabs
        selectedIndex={0}
        onTabSelect={(tab) => {
          console.log(`Tab ${tab.index} selected`);
        }}
      >
        <Tab header={"Tab 0"}>
          <TabContent0 text={"Tab content 0"} />
        </Tab>
        <Tab header={"Tab 1"}>
          <TabContent1 />
        </Tab>
        <Tab header={"Tab 2"}>
          <StatefulComponent />
        </Tab>
      </Tabs>
    </div>
  );
}
