import { useNavigate } from "@remix-run/react";

// ui
import { AutoComplete } from "~/components/ui/autocomplete";

// types
type Result = {
  value: string;
  label: string;
  poster: string | null;
};

type Props = {
  inputValue: string;
  setInputValue: (value: string) => void;
  data:
    | {
        results: Result[];
        statusCode: number;
      }
    | undefined;
  error: Error | null;
  isLoading: boolean;
};

export function AutocompleteTitles({ inputValue, setInputValue, data, error, isLoading }: Props) {
  // remix hooks
  const navigate = useNavigate();

  const noResultsMessage = "No hay resultados.";
  const minimumCharactersMessage = "Ingresa al menos 3 caracteres para buscar.";

  const emptyMessage = error ? "Error al buscar." : inputValue.length < 3 ? minimumCharactersMessage : noResultsMessage;

  return (
    <AutoComplete
      options={data && data.statusCode === 200 ? data.results : []}
      emptyMessage={emptyMessage}
      placeholder="¿Qué vas a ver hoy?"
      onInputChange={(inputValue) => {
        if (typeof inputValue === "string") {
          setInputValue(inputValue);
        }
      }}
      onValueChange={(selectedValue) => {
        navigate(`/subtitles/movie/${selectedValue.value}`);
      }}
      inputValue={inputValue}
      isLoading={isLoading}
      disabled={false}
    />
  );
}
