worker_processes 2 # amount of unicorn workers to spin up
timeout 240         # restarts workers that hang for 30 seconds
listen "/tmp/unicorn-hello.sock", :backlog => 64
listen 8080, :tcp_nopush => true
pid "/tmp/unicorn-hello.pid"