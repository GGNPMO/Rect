# Employee Payroll System

Vite + React frontend for the employee payroll system. The production container builds the app with Node and serves the static files with Nginx.

## API configuration

The frontend uses the same-origin `/api` path by default. Nginx proxies it to the API on `http://localhost:3000`, so browser requests from port `8080` do not require CORS headers:

```powershell
docker build --no-cache -t payroll-ui:latest .
```

`VITE_API_URL` is a public frontend setting and is embedded in the JavaScript bundle. Do not put tokens, passwords, or other secrets in it. The API must allow requests from the frontend origin when using a different origin.

## Build and run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:8080` when running the frontend locally.

Build and serve the production image locally:

```powershell
docker build --no-cache -t payroll-ui:latest .
docker run --rm --add-host=host.docker.internal:host-gateway -p 8080:8080 payroll-ui:latest
```

Open `http://localhost:8080`. The Nginx health endpoint is `http://localhost:8080/healthz`.

## Kubernetes manifests

The manifests use one replica, small CPU/memory limits, an internal `ClusterIP` service, and HTTP readiness/liveness checks. No cloud load balancer is created.

### Minikube

```powershell
minikube start
docker build -t payroll-ui:latest .
minikube image load payroll-ui:latest
kubectl apply -k k8s
kubectl rollout status deployment/payroll-ui
kubectl port-forward service/payroll-ui 8080:8080
```

Open `http://localhost:8080` while the port-forward is running.

### Kind

```powershell
kind create cluster --name payroll
docker build -t payroll-ui:latest .
kind load docker-image payroll-ui:latest --name payroll
kubectl apply -k k8s
kubectl rollout status deployment/payroll-ui
kubectl port-forward service/payroll-ui 8080:8080
```

### Azure AKS

Use an existing Azure Container Registry where possible to minimize Azure cost. ACR Basic and AKS resources can incur charges even when this app is idle.

```powershell
az aks get-credentials --resource-group <resource-group> --name <aks-cluster>
az acr login --name <acr-name>

docker build --build-arg VITE_API_URL=https://<api-host>/api -t <acr-name>.azurecr.io/payroll-ui:v1 .
docker push <acr-name>.azurecr.io/payroll-ui:v1

kubectl apply -k k8s
kubectl -n default set image deployment/payroll-ui payroll-ui=<acr-name>.azurecr.io/payroll-ui:v1
kubectl rollout status deployment/payroll-ui
```

The AKS cluster must be able to pull from the registry, for example by attaching ACR to the cluster:

```powershell
az aks update --resource-group <resource-group> --name <aks-cluster> --attach-acr <acr-name>
```

The service remains internal. For a low-cost private/admin check, use:

```powershell
kubectl port-forward service/payroll-ui 8080:8080
```

Add an ingress or public load balancer only when external access is required and the associated Azure cost is acceptable.

## Update and remove

For a local cluster, rebuild and load the image, then redeploy:

```powershell
docker build -t payroll-ui:latest .
minikube image load payroll-ui:latest  # Minikube only
# kind load docker-image payroll-ui:latest --name payroll  # Kind only
kubectl apply -k k8s
kubectl rollout status deployment/payroll-ui
```

For AKS, push a new version tag and update the deployment image:

```powershell
docker build --build-arg VITE_API_URL=https://<api-host>/api -t <acr-name>.azurecr.io/payroll-ui:v2 .
docker push <acr-name>.azurecr.io/payroll-ui:v2
kubectl -n default set image deployment/payroll-ui payroll-ui=<acr-name>.azurecr.io/payroll-ui:v2
kubectl rollout status deployment/payroll-ui
```

Remove the application with:

```powershell
kubectl delete -k k8s
```
