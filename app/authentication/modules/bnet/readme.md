Last Updated 21 May, 2021

The Facebook OAuth API requires a few settings and errors may be unclear.
1. Create an app at developers.facebook.com
2. Once created, go to Settings > Basic
	+ You should end up somewhere like `https://developers.facebook.com/apps/#######/settings/basic/`
3. Add your domain(s) to "App Domains"
	+ The App also provides "privacy", "retention", and "terms" pages
4. Once set, on the left near the bottom (Possibly moved) go to "Facebook Login" > "Settings"
5. Here, add your callback URLs

If you see an error regarding your "App Domains", this could refer to the Callback URLs and your App Domains may be fine.
