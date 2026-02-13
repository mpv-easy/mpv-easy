import { tooltipSelector } from "./store"
import { useSelector } from "./models"

export const useTitle = (title: string) => {
  const tooltip = useSelector(tooltipSelector)
  return tooltip ? title : ""
}
