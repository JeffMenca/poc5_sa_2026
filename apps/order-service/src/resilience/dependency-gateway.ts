import type { BreakerSnapshot, DependencyKey, ResilienceSettings } from "@poc5/contracts";
import type { HttpRequest } from "../http/http-request";
import { ResilientDependency } from "./resilient-dependency";

export interface ServiceCaller {
  call<T>(service: DependencyKey, request: HttpRequest): Promise<T>;
}

export class DependencyGateway implements ServiceCaller {
  private readonly dependencies: ResilientDependency[];

  constructor(urls: Record<DependencyKey, string>, settings: ResilienceSettings) {
    this.dependencies = (Object.keys(urls) as DependencyKey[]).map(
      (name) => new ResilientDependency(name, urls[name], settings),
    );
  }

  call<T>(service: DependencyKey, request: HttpRequest): Promise<T> {
    return this.dependency(service).call<T>(request);
  }

  snapshots(): Promise<BreakerSnapshot[]> {
    return Promise.all(this.dependencies.map((dependency) => dependency.snapshot()));
  }

  reset(): void {
    this.dependencies.forEach((dependency) => dependency.reset());
  }

  private dependency(service: DependencyKey): ResilientDependency {
    const found = this.dependencies.find((dependency) => dependency.name === service);
    if (!found) throw new Error(`No dependency registered for ${service}`);
    return found;
  }
}
