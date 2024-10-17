import type { MetaFunction } from "@remix-run/node";

export function loader() {
  console.log('running loader')
  return null
}

export const meta: MetaFunction = () => {
  return [
    { title: "Subtis" },
    { name: "description", content: "Welcome to Subtis!" },
  ];
};

export default function Index() {
  return (
    <span>home</span>
  );
}

