import {
  LocalPizza,
  Fastfood,
  LunchDining,
  Restaurant,
  LocalDrink,
  Cake,
  SetMeal,
  Icecream,
  EmojiFoodBeverage,
  BakeryDining,
  Tapas,
  RamenDining,
  LocalCafe,
  SportsBar,
  WineBar,
} from "@mui/icons-material";
import { SvgIcon } from "@mui/material";

export const CATEGORY_ICONS: Record<string, JSX.Element> = {
  LocalPizza: <LocalPizza fontSize="large" />,
  Fastfood: <Fastfood fontSize="large" />,
  LunchDining: <LunchDining fontSize="large" />,
  Restaurant: <Restaurant fontSize="large" />,
  LocalDrink: <LocalDrink fontSize="large" />,
  Cake: <Cake fontSize="large" />,
  SetMeal: <SetMeal fontSize="large" />,
  Icecream: <Icecream fontSize="large" />,
  EmojiFoodBeverage: <EmojiFoodBeverage fontSize="large" />,
  BakeryDining: <BakeryDining fontSize="large" />,
  Tapas: <Tapas fontSize="large" />,
  RamenDining: <RamenDining fontSize="large" />,
  LocalCafe: <LocalCafe fontSize="large" />,
  SportsBar: <SportsBar fontSize="large" />,
  WineBar: <WineBar fontSize="large" />,
  Taco: (
    <SvgIcon fontSize="large">
      <path d="M19,18H5A4,4 0 0,1 1,14A8,8 0 0,1 9,6C10.06,6 11.07,6.21 12,6.58C12.93,6.21 13.94,6 15,6A8,8 0 0,1 23,14A4,4 0 0,1 19,18M3,14A2,2 0 0,0 5,16A2,2 0 0,0 7,14C7,11.63 8.03,9.5 9.67,8.04L9,8A6,6 0 0,0 3,14M19,16A2,2 0 0,0 21,14A6,6 0 0,0 15,8A6,6 0 0,0 9,14C9,14.73 8.81,15.41 8.46,16H19Z" />
    </SvgIcon>
  ),
  Soda: (
    <SvgIcon fontSize="large">
      <path d="M15 11V20A2 2 0 0 1 13 22H11A2 2 0 0 1 9 20V11A2 2 0 0 1 9.6 9.58C11.1 7.89 11 4 11 4H10V2H14V4H13S12.9 7.89 14.4 9.58A2 2 0 0 1 15 11Z" />
    </SvgIcon>
  ),
};
