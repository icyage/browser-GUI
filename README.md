# MASQ Node Browser-GUI
Browser Based MASQ GUI based on the MASQNodeUI-v2 interface 

This was created by the team of volunteers at MASQ Project, with special mention to our friend at @SubNodes_io

To successfully run this GUI, you must right initialize the MASQ daemon.

The easiest way to download this at the moment is to take the most recent build from our masq-results repo - this can be found here:
https://github.com/masq-results/MASQ-results

Ensure you download the correct file for your operating system.

The downloaded tar file contains all files under the 'generated' folder, with a folder called 'bin' containing the three executables:
dns_utility, masq & MASQNode

These 3 files are what you need to get MASQ Node started - if you move them to a folder of your choice, you will have to navigate to the folder path from a terminal window

Run an elevated Command Prompt on your machine, navigate the the folder where you extracted the files and run the initialization command:

Windows - `./MASQNode --initialization`
Mac - `sudo -E ./MASQNode --initialization`
Linux - `sudo ./MASQNode --initialization` (you will likely then be prompted for your password)
