/**
 * Value Object — Immutable, equality by structure.
 * Value objects have no identity; two are equal if all properties match.
 */
export abstract class ValueObject<TProps> {
  protected readonly props: Readonly<TProps>;

  constructor(props: TProps) {
    this.props = Object.freeze({ ...props });
  }

  equals(other: ValueObject<TProps>): boolean {
    if (!(other instanceof ValueObject)) return false;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  toJSON(): TProps {
    return { ...this.props };
  }
}
