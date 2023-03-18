export interface Metric<Type> {
   name: string;
   value: Type;
}


export interface MetricService<Type> {
   metrics: Metric<Type>[]
   name: string;
   addMetric(value: Type): void;
}

export class WPMMetricService implements MetricService<number> {
   metrics: Metric<number>[];
   name: string;

   constructor(name: string) {
      this.name = name;
      this.metrics = [];
   }

   addMetric(value: number): void {
      this.metrics.push({ name: this.name, value: value });
   }

}