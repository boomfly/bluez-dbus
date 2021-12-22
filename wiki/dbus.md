dbus-send --print-reply --dest=org.mpris.MediaPlayer2.vlc /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Play

dbus-send --system --print-reply --dest=org.bluez /org/bluez org.bluez.AgentManager1

    this.helper = new BusHelper(dbus, 'org.bluez', '/org/bluez', 'org.bluez.AgentManager1', { useProps: false })


  socat TCP-LISTEN:7272,reuseaddr,fork UNIX-CONNECT:/var/run/dbus/system_bus_socket


   socat UNIX-LISTEN:/tmp/custom_dbus_name,fork TCP:192.168.8.107:7272


  rm /tmp/custom_dbus_name; ssh -nNT -L /tmp/custom_dbus_name:/var/run/dbus/system_bus_socket pi@192.168.8.115


  tail -f /var/log/syslog

  sudo dbus-monitor --system


  scp wiki/bluetooth.conf pi@192.168.8.115:/etc/dbus-1/system.d/bluetooth.conf

  rsync --rsync-path="sudo rsync" wiki/bluetooth.conf pi@192.168.8.115:/etc/dbus-1/system.d/bluetooth.conf