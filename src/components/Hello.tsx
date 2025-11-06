type Props = { name?: string }

export default function Hello({ name = 'world' }: Props) {
  return <p>Hello, {name}!</p>
}
