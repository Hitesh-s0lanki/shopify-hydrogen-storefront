import {Button} from '~/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <Button>Click me</Button>
    </div>
  );
}
