package main
 
import (
	"flag"
	"os"
	"fmt"
	"net/http"
	"encoding/json"
	"context"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

const (
	APIVersion       = "1.25"
)

func appsHandler(w http.ResponseWriter, r *http.Request) {
    // init docker client
	apiClient, err := client.NewClientWithOpts(client.FromEnv, client.WithVersion(APIVersion))
	if err != nil {
		panic(err)
	}
	defer apiClient.Close()

    // get ContainerList
	containers, err := apiClient.ContainerList(context.Background(), container.ListOptions{All: true})
	if err != nil {
		panic(err)
	}

	// parsing ContainerList
 	type App struct {
 	    Name string
 	    Description string
 	    Href string
 	    Icon string
 	    Status string
 	}

	apps := make([]App, 0)

	for _, ctr := range containers {
		ContainerName			:= ctr.Labels["suigo.name"]
		if ContainerName == "" {
			continue
		}
		ContainerDescription	:= ctr.Labels["suigo.description"]
		ContainerHref 			:= ctr.Labels["suigo.href"]
		ContainerIcon 			:= ctr.Labels["suigo.icon"]
		ContainerState 			:= ctr.State
		apps = append(apps, App{ContainerName,ContainerDescription,ContainerHref,ContainerIcon, ContainerState})
	}
	
	appsJson, err := json.Marshal(apps)
	if err != nil {
		panic(err)
	}

	// print result
    fmt.Fprintf(w, "{\"apps\" : " + string(appsJson) + "}")
}

var host *string
var port *uint64

func main() {

	port := flag.Uint64("p", 8080, "port")
	host := flag.String("h", "0.0.0.0", "host")

	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "USAGE: ./suigo -h=0.0.0.0 p=8080 \n")
		flag.PrintDefaults()
		os.Exit(1)
	}
	
	flag.Parse()
			
	fileAssets := http.FileServer(http.Dir("./assets")) //is it safe at all?
	http.Handle("/", fileAssets)
	http.HandleFunc("/apps.json", appsHandler)
	http.HandleFunc("/links.json", func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, "./config/links.json")
		})

	address := fmt.Sprintf("%s:%d", *host, *port)
	fmt.Printf("Starting server: " + address + "\n")
	err := http.ListenAndServe(address, nil)
	if err != nil {
		panic(err)
	}
}
