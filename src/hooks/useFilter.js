import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const EQUAL_SIGN = "~";
export const AND_SIGN = "+";
export const ARRAY_SEPARATOR = "--";

const parseUrl = (url) => {
  const queryString = url.split("?")[1];
  if (!queryString) return {};

  return queryString.split(AND_SIGN).reduce((acc, pair) => {
    const [key, value] = pair.split(EQUAL_SIGN);
    acc[key] =
      key === "seller-type" || key === "brand"
        ? value.split(ARRAY_SEPARATOR).map(canBeParsedAsInt)
        : canBeParsedAsInt(value);

    return acc;
  }, {});
};

const stringifyUrl = (data) => {
  return (
    "?" +
    Object.entries(data)
      .map(([key, value]) => {
        console.log(value);
        return Array.isArray(value)
          ? `${key}${EQUAL_SIGN}${value.join(ARRAY_SEPARATOR)}`
          : `${key}${EQUAL_SIGN}${value}`;
      })
      .join(AND_SIGN)
  );
};

const canBeParsedAsInt = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && !isNaN(num) ? num : value;
};

const useFilter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const filterState = useMemo(
    () => parseUrl(location.search),
    [location.search]
  );

  const setFilterState = (newState) => {
    navigate(stringifyUrl(newState));
    console.log(newState);
  };

  const onChange = (e, name, type) => {
    const value = canBeParsedAsInt(e.target.value);
    const newFilterState = { ...filterState };

    if (type === "checkbox-group") {
      const checkbox = filterState[name];
      newFilterState[name] =
        checkbox && !checkbox.includes(value) ? [...checkbox, value] : [value];
    } else {
      newFilterState[name] = value;
    }

    setFilterState(newFilterState);
  };

  const onClear = (name) => {
    const newFilterState = { ...filterState };
    delete newFilterState[name];
    setFilterState(newFilterState);
  };

  const onClearAll = () => setFilterState({});

  return { filterState, setFilterState, onChange, onClear, onClearAll };
};

export default useFilter;
