![Image of SquidUI](https://git.makz.me/harkor/octopouet/raw/master/img/squid.png)
> Icon made by Freepik

## Prerequisites

- bower
- Enable and set API settings (in OctoPrint interface)
- U need to edit **/etc/haproxy/haproxy.cfg** on octoprint installation with the following lines

### Lines
    frontend octoprint
        ...
        # CORS Config Capture
        capture request header origin len 50
        ...

    backend octoprint
        ...
        # Add CORS headers when Origin header is present
        http-response set-header Access-Control-Allow-Credentials true
        http-response set-header Access-Control-Allow-Origin %[capture.req.hdr(0)]
        ...

- Save file and reboot OctoPrint

## How to install

- Clone the repository
- Go to the directory of the project
- Dupplicate "env.example.js" with "env.js" and set octoprint settings
- npm install
- Access the file with your browser
