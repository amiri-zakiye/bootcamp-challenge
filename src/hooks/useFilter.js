import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormType from "../constants/FormType";

export const EQUAL_SIGN = "~";
export const AND_SIGN = "+";
export const ARRAY_SEPARATOR = "--";

function parseUrl(url) {
  const queryString = url.split("?")[1];

  if (!queryString) {
    return {};
  }

  const data = {};

  const pairs = queryString.split(AND_SIGN);

  pairs.forEach((pair) => {
    const [key, value] = pair.split(EQUAL_SIGN);
    data[key] = value;
  });

  return data;
}

function stringifyUrl(data) {
  let str = "?";

  const parts = Object.keys(data)
    .map((key) => {
      if (data[key]) {
        if (typeof data[key] === "object") {
          return `${key}${EQUAL_SIGN}${data[key].join(ARRAY_SEPARATOR)}`;
        } else {
          return `${key}${EQUAL_SIGN}${data[key]}`;
        }
      }
      return null;
    })
    .filter((part) => part !== null);

  str += parts.join(AND_SIGN);

  return str;
}

function canBeParsedAsInt(value) {
  const num = Number(value);
  const ifInt = Number.isInteger(num) && !isNaN(num);
  if (ifInt) {
    return parseInt(num);
  }
  return value;
}

// TODO: complete this hook
function useFilter(formData) {
  const location = useLocation();
  let filterState = useMemo(() => parseUrl(location.search), [location.search]);

  const setFilterState = (s) => {
    navigate(stringifyUrl(s));
  };

  const navigate = useNavigate();

  function onChange(e, name, type) {
    const value = canBeParsedAsInt(e.target.value);
    if (type === "checkbox-group") {
      if (filterState[name] && !filterState[name].includes(value)) {
        setFilterState({
          ...filterState,
          [name]: [...filterState[name], value],
        });
      } else {
        setFilterState({ ...filterState, [name]: [value] });
      }
    } else if (type === "range") {
      setFilterState({ ...filterState, [name]: e.target.value });
    } else {
      setFilterState({ ...filterState, [name]: value });
    }
  }


  function onClear(name) {
    const newFilterState = { ...filterState };
    delete newFilterState[name];
    setFilterState(newFilterState);
  }
  function onClearAll() {
    setFilterState({});
  }

  return { filterState, setFilterState, onChange, onClear, onClearAll };
}

export default useFilter;
