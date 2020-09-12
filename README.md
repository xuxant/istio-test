## Deploying the application(Dummy Microservice) to existing kubernetes Cluster with istio configured.

In this repository there are two dummy service named service-one and service-two. Each of the service expose two endpoint. For service-one following two endpoint are exposed. 
    
    {{url}}/product
    {{url}}/product/:id

As for the service-two, it too expose two endpoints which are,

```URL
{{url}}/store
{{url}}/product/:id
```

In each of the service directory there is a dockerfile, which you can use to build the image. You can build the image for service-one and service two with the following command.

```bash
susanta@shanks:~/istio-test$ cd service-one
susanta@shanks:~/istio-test/service-one$ docker build -t imagename_one:tagname .
susanta@shanks:~/istio-test/service-one$ docker push imagename_one:tagname
susanta@shanks:~/istio-test/service-one$ cd ../service-two
susanta@shanks:~/istio-test/service-two$ docker build -t imagename_two:tagname .
susanta@shanks:~/istio-test/service-two$ docker push imagename_two:tagname
```

## Deploying Application using Helm

There is the helm chart contained inside the helm-chart directory. First please go through [values.yaml](helm-chart/services/values.yaml) file to modify some values such as image name under image_one and image_two.
```YAML
image_one:
  repository: xuxant/service-one
  pullPolicy: IfNotPresent
  tag: "latest"

image_two:
  repository: xuxant/service-two
  pullPolicy: IfNotPresent
  tag: "latest"
```
Please Replace the value in repository with the name you have tagged and pushed the image to your registry.

Also there is another section in [values.yaml](helm-chart/services/values.yaml) file you need to consider. Please use the valid domain name and secret. Please note that the tls secret is to be created in the istio-system namespace. You can use the following command to create the secret.
```BASH
susanta@shanks:~/istio-test/k8s/certs$ kubectl create secret -n istio-system ingress-tls-cert tls --key=domain.key --cert=domain.crt
```
After you have created the secret, modify the values.yaml file with valid secret name just as below.
```YAML
istio:
  enabled: true
  annotations: {}
  httpPort: 80
  host: service.demo.com
  tls:
    enabled: true
    httpsPort: 443 
    credentialName: ingress-tls-cert
```
If in the above section, if you use the value of ```istio.tls.enabled: false``` Gateway service will configured to listen on port 80 only.

Now apply the helm chart.
```YAML
susanta@shanks:~/istio-test$ helm install service ./helm-chart/services
```
The application will be deployed to the default namespace.

Now you can access the application with hostname you have provided.
```BASH
curl -i https://service.demo.com/product
```


## Deploying application using manifest files.
First edit the manifest file in the k8s directory. in that directory there are following files.

File to create the namespace for deploying the service. [namespace.yaml](k8s/deployment/namespace.yaml) This manifest will create the namespace in kubernetes cluster to which we will deploy our services. Please use the following steps to deploy the application.

```bash
susanta@shanks:~/istio-test$ kubectl apply -f k8s/deployment/namespace.yaml
```
Now let's deploy both dummy microservices [workload.yaml](k8s/deployment/workload.yaml). This manifest will deploy both of the services. Please keep in mind that please change the name of the image of both of services in manifest in accordence to the name you have tagged above. Also let's deploy the service file [service.yaml](k8s/deployment/service.yaml) too.

```bash
susanta@shanks:~/istio-test$ kubectl apply -f k8s/deployment/workload.yaml
susanta@shanks:~/istio-test$ kubectl apply -f k8s/deployment/service.yaml
```

Now in next step let's configure istio part. In this configuration, we will be using istio-ingressgateway as an entrypoint to our cluster and virtualservice and destination rule to manipulate the traffic.

Here we will be deploying the services in following order. Keep in mind that order is not that important while deploying the file.
1. [Gateway manifest](k8s/istio/gateway.yaml)
2. [Virtualservice manifest](k8s/istio/virtualservice.yaml)
3. [Destinationrule manifest](k8s/istio/destinationrule.yaml)

Before applying these manifest, let's create our tls secret that will be used as the certificate for encrypting the traffic. There is selfsigned certificate in cert directory which can be used for demo purpose. Please feel free replace them with valid certificate.

```bash
susanta@shanks:~/istio-test/k8s/certs$ kubectl create secret -n istio-system ingress-tls-cert tls --key=domain.key --cert=domain.crt
```

```bash
susanta@shanks:~/istio-test$ kubectl apply -f k8s/istio/gateway.yaml
susanta@shanks:~/istio-test$ kubectl apply -f k8s/istio/virtualservice.yaml
susanta@shanks:~/istio-test$ kubectl apply -f k8s/istio/destinationrule.yaml
```

Now let's talk about the gateway service.

```YAML
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: service-gateway
  namespace: service
spec:
  selector:
    istio: ingressgateway
  servers:
    - hosts:
        - domain.example.com

      port:
        number: 80
        name: http
        protocol: HTTP
      tls:
        httpsRedirect: true

    - hosts:
        - domain.example.com

      port:
        number: 443
        name: https
        protocol: HTTPS

      tls:
        mode: SIMPLE
        credentialName: ingress-tls-cert
```

In the above manifest, it is the code of the gateway manifest. While configuring the service, please replace the domain name in hosts section from above. Also, `credentialName` key is the representation of the tls secret you have created. If you have other secret configured, please feel free to replace them.

